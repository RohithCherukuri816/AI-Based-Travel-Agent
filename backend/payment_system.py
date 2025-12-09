"""
AI Travel Planning Agent - Payment Processing System
Secure payment handling for bookings and subscriptions
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass
from enum import Enum
import stripe
import paypalrestsdk
from decimal import Decimal

from config import get_payment_config, settings
from models import Payment, User, Trip

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PaymentMethod(str, Enum):
    """Available payment methods"""
    STRIPE = "stripe"
    PAYPAL = "paypal"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"


class PaymentType(str, Enum):
    """Types of payments"""
    TRIP_BOOKING = "trip_booking"
    SUBSCRIPTION = "subscription"
    PREMIUM_FEATURE = "premium_feature"
    REFUND = "refund"


class PaymentStatus(str, Enum):
    """Payment statuses"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


@dataclass
class PaymentRequest:
    """Payment request structure"""
    amount: Decimal
    currency: str = "USD"
    description: str = ""
    payment_method: PaymentMethod = PaymentMethod.STRIPE
    payment_type: PaymentType = PaymentType.TRIP_BOOKING
    metadata: Dict[str, Any] = None
    customer_email: Optional[str] = None
    customer_id: Optional[str] = None
    trip_id: Optional[str] = None
    user_id: Optional[str] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class PaymentResult:
    """Payment result structure"""
    success: bool
    payment_id: Optional[str] = None
    transaction_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    amount: Optional[Decimal] = None
    currency: str = "USD"
    error_message: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    redirect_url: Optional[str] = None


class StripePaymentProcessor:
    """Stripe payment processor"""
    
    def __init__(self, secret_key: str, publishable_key: str):
        self.secret_key = secret_key
        self.publishable_key = publishable_key
        stripe.api_key = secret_key
    
    async def create_payment_intent(self, payment_request: PaymentRequest) -> PaymentResult:
        """Create a Stripe payment intent"""
        try:
            # Convert amount to cents (Stripe uses smallest currency unit)
            amount_cents = int(payment_request.amount * 100)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=payment_request.currency.lower(),
                description=payment_request.description,
                metadata=payment_request.metadata,
                customer_email=payment_request.customer_email,
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            
            return PaymentResult(
                success=True,
                payment_id=intent.id,
                transaction_id=intent.id,
                status=PaymentStatus.PROCESSING,
                amount=payment_request.amount,
                currency=payment_request.currency,
                gateway_response={
                    "client_secret": intent.client_secret,
                    "publishable_key": self.publishable_key
                }
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                amount=payment_request.amount,
                currency=payment_request.currency
            )
    
    async def confirm_payment(self, payment_intent_id: str) -> PaymentResult:
        """Confirm a Stripe payment"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == "succeeded":
                return PaymentResult(
                    success=True,
                    payment_id=intent.id,
                    transaction_id=intent.id,
                    status=PaymentStatus.COMPLETED,
                    amount=Decimal(intent.amount) / 100,
                    currency=intent.currency.upper(),
                    gateway_response={"intent": intent}
                )
            elif intent.status == "requires_payment_method":
                return PaymentResult(
                    success=False,
                    payment_id=intent.id,
                    error_message="Payment method required",
                    status=PaymentStatus.PENDING
                )
            else:
                return PaymentResult(
                    success=False,
                    payment_id=intent.id,
                    error_message=f"Payment status: {intent.status}",
                    status=PaymentStatus.FAILED
                )
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment confirmation failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )
    
    async def refund_payment(self, payment_intent_id: str, amount: Optional[Decimal] = None) -> PaymentResult:
        """Refund a Stripe payment"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if amount:
                refund_amount = int(amount * 100)
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id,
                    amount=refund_amount
                )
            else:
                refund = stripe.Refund.create(payment_intent=payment_intent_id)
            
            return PaymentResult(
                success=True,
                payment_id=refund.id,
                transaction_id=refund.id,
                status=PaymentStatus.REFUNDED,
                amount=Decimal(refund.amount) / 100,
                currency=refund.currency.upper(),
                gateway_response={"refund": refund}
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )
    
    async def create_subscription(self, customer_id: str, price_id: str) -> PaymentResult:
        """Create a Stripe subscription"""
        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"]
            )
            
            return PaymentResult(
                success=True,
                payment_id=subscription.id,
                transaction_id=subscription.latest_invoice.payment_intent.id,
                status=PaymentStatus.PROCESSING,
                gateway_response={
                    "subscription": subscription,
                    "client_secret": subscription.latest_invoice.payment_intent.client_secret
                }
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe subscription creation failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )


class PayPalPaymentProcessor:
    """PayPal payment processor"""
    
    def __init__(self, client_id: str, client_secret: str, sandbox: bool = True):
        self.client_id = client_id
        self.client_secret = client_secret
        self.sandbox = sandbox
        
        # Configure PayPal SDK
        paypalrestsdk.configure({
            "mode": "sandbox" if sandbox else "live",
            "client_id": client_id,
            "client_secret": client_secret
        })
    
    async def create_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        """Create a PayPal payment"""
        try:
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": f"{settings.HOST}/payment/success",
                    "cancel_url": f"{settings.HOST}/payment/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": payment_request.description,
                            "sku": "item",
                            "price": str(payment_request.amount),
                            "currency": payment_request.currency,
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": str(payment_request.amount),
                        "currency": payment_request.currency
                    },
                    "description": payment_request.description
                }]
            })
            
            if payment.create():
                # Get approval URL
                approval_url = None
                for link in payment.links:
                    if link.rel == "approval_url":
                        approval_url = link.href
                        break
                
                return PaymentResult(
                    success=True,
                    payment_id=payment.id,
                    transaction_id=payment.id,
                    status=PaymentStatus.PENDING,
                    amount=payment_request.amount,
                    currency=payment_request.currency,
                    redirect_url=approval_url,
                    gateway_response={"payment": payment}
                )
            else:
                return PaymentResult(
                    success=False,
                    error_message="PayPal payment creation failed",
                    amount=payment_request.amount,
                    currency=payment_request.currency
                )
                
        except Exception as e:
            logger.error(f"PayPal payment creation failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                amount=payment_request.amount,
                currency=payment_request.currency
            )
    
    async def execute_payment(self, payment_id: str, payer_id: str) -> PaymentResult:
        """Execute a PayPal payment"""
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                return PaymentResult(
                    success=True,
                    payment_id=payment.id,
                    transaction_id=payment.id,
                    status=PaymentStatus.COMPLETED,
                    amount=Decimal(payment.transactions[0].amount.total),
                    currency=payment.transactions[0].amount.currency,
                    gateway_response={"payment": payment}
                )
            else:
                return PaymentResult(
                    success=False,
                    payment_id=payment.id,
                    error_message="PayPal payment execution failed",
                    status=PaymentStatus.FAILED
                )
                
        except Exception as e:
            logger.error(f"PayPal payment execution failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )
    
    async def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> PaymentResult:
        """Refund a PayPal payment"""
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            # Get the sale ID from the payment
            sale_id = None
            for transaction in payment.transactions:
                for resource in transaction.related_resources:
                    if hasattr(resource, 'sale'):
                        sale_id = resource.sale.id
                        break
                if sale_id:
                    break
            
            if not sale_id:
                return PaymentResult(
                    success=False,
                    error_message="Sale ID not found",
                    status=PaymentStatus.FAILED
                )
            
            # Create refund
            refund = paypalrestsdk.Refund({
                "amount": {
                    "total": str(amount) if amount else payment.transactions[0].amount.total,
                    "currency": payment.transactions[0].amount.currency
                }
            })
            
            if refund.create(sale_id):
                return PaymentResult(
                    success=True,
                    payment_id=refund.id,
                    transaction_id=refund.id,
                    status=PaymentStatus.REFUNDED,
                    amount=Decimal(refund.amount.total),
                    currency=refund.amount.currency,
                    gateway_response={"refund": refund}
                )
            else:
                return PaymentResult(
                    success=False,
                    payment_id=refund.id,
                    error_message="PayPal refund failed",
                    status=PaymentStatus.FAILED
                )
                
        except Exception as e:
            logger.error(f"PayPal refund failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )


class PaymentManager:
    """Centralized payment management"""
    
    def __init__(self):
        self.payment_config = get_payment_config()
        
        # Initialize payment processors
        self.stripe_processor = None
        self.paypal_processor = None
        
        if self.payment_config["stripe"]["enabled"]:
            self.stripe_processor = StripePaymentProcessor(
                self.payment_config["stripe"]["secret_key"],
                self.payment_config["stripe"]["publishable_key"]
            )
        
        if self.payment_config["paypal"]["enabled"]:
            self.paypal_processor = PayPalPaymentProcessor(
                self.payment_config["paypal"]["client_id"],
                self.payment_config["paypal"]["client_secret"]
            )
    
    async def process_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        """Process a payment request"""
        try:
            if payment_request.payment_method == PaymentMethod.STRIPE and self.stripe_processor:
                return await self.stripe_processor.create_payment_intent(payment_request)
            
            elif payment_request.payment_method == PaymentMethod.PAYPAL and self.paypal_processor:
                return await self.paypal_processor.create_payment(payment_request)
            
            else:
                return PaymentResult(
                    success=False,
                    error_message=f"Payment method {payment_request.payment_method} not available",
                    amount=payment_request.amount,
                    currency=payment_request.currency
                )
                
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                amount=payment_request.amount,
                currency=payment_request.currency
            )
    
    async def confirm_payment(self, payment_id: str, payment_method: PaymentMethod) -> PaymentResult:
        """Confirm a payment"""
        try:
            if payment_method == PaymentMethod.STRIPE and self.stripe_processor:
                return await self.stripe_processor.confirm_payment(payment_id)
            
            else:
                return PaymentResult(
                    success=False,
                    error_message=f"Payment confirmation not supported for {payment_method}",
                    status=PaymentStatus.FAILED
                )
                
        except Exception as e:
            logger.error(f"Payment confirmation failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )
    
    async def execute_paypal_payment(self, payment_id: str, payer_id: str) -> PaymentResult:
        """Execute a PayPal payment"""
        if not self.paypal_processor:
            return PaymentResult(
                success=False,
                error_message="PayPal processor not available",
                status=PaymentStatus.FAILED
            )
        
        return await self.paypal_processor.execute_payment(payment_id, payer_id)
    
    async def refund_payment(
        self, 
        payment_id: str, 
        payment_method: PaymentMethod, 
        amount: Optional[Decimal] = None
    ) -> PaymentResult:
        """Refund a payment"""
        try:
            if payment_method == PaymentMethod.STRIPE and self.stripe_processor:
                return await self.stripe_processor.refund_payment(payment_id, amount)
            
            elif payment_method == PaymentMethod.PAYPAL and self.paypal_processor:
                return await self.paypal_processor.refund_payment(payment_id, amount)
            
            else:
                return PaymentResult(
                    success=False,
                    error_message=f"Refund not supported for {payment_method}",
                    status=PaymentStatus.FAILED
                )
                
        except Exception as e:
            logger.error(f"Payment refund failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                status=PaymentStatus.FAILED
            )
    
    async def create_subscription(self, customer_id: str, price_id: str) -> PaymentResult:
        """Create a subscription"""
        if not self.stripe_processor:
            return PaymentResult(
                success=False,
                error_message="Stripe processor not available",
                status=PaymentStatus.FAILED
            )
        
        return await self.stripe_processor.create_subscription(customer_id, price_id)
    
    def get_supported_payment_methods(self) -> List[PaymentMethod]:
        """Get list of supported payment methods"""
        methods = []
        
        if self.payment_config["stripe"]["enabled"]:
            methods.append(PaymentMethod.STRIPE)
        
        if self.payment_config["paypal"]["enabled"]:
            methods.append(PaymentMethod.PAYPAL)
        
        return methods


# Global payment manager instance
payment_manager = PaymentManager()


# Payment service functions
class PaymentService:
    """High-level payment service for business logic"""
    
    @staticmethod
    async def book_trip(
        user_id: str,
        trip_id: str,
        amount: Decimal,
        currency: str = "USD",
        payment_method: PaymentMethod = PaymentMethod.STRIPE
    ) -> PaymentResult:
        """Book a trip with payment"""
        try:
            # Create payment request
            payment_request = PaymentRequest(
                amount=amount,
                currency=currency,
                description=f"Trip booking for trip {trip_id}",
                payment_method=payment_method,
                payment_type=PaymentType.TRIP_BOOKING,
                metadata={
                    "trip_id": trip_id,
                    "user_id": user_id,
                    "booking_type": "trip"
                },
                user_id=user_id,
                trip_id=trip_id
            )
            
            # Process payment
            result = await payment_manager.process_payment(payment_request)
            
            if result.success:
                # Save payment record to database
                await PaymentService._save_payment_record(
                    user_id, trip_id, amount, currency, payment_method, result
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Trip booking payment failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                amount=amount,
                currency=currency
            )
    
    @staticmethod
    async def upgrade_subscription(
        user_id: str,
        plan_type: str,
        amount: Decimal,
        currency: str = "USD",
        payment_method: PaymentMethod = PaymentMethod.STRIPE
    ) -> PaymentResult:
        """Upgrade user subscription"""
        try:
            payment_request = PaymentRequest(
                amount=amount,
                currency=currency,
                description=f"Subscription upgrade to {plan_type}",
                payment_method=payment_method,
                payment_type=PaymentType.SUBSCRIPTION,
                metadata={
                    "user_id": user_id,
                    "plan_type": plan_type,
                    "subscription_type": "upgrade"
                },
                user_id=user_id
            )
            
            result = await payment_manager.process_payment(payment_request)
            
            if result.success:
                # Save payment record
                await PaymentService._save_payment_record(
                    user_id, None, amount, currency, payment_method, result
                )
                
                # Update user subscription (in real app, this would update database)
                logger.info(f"User {user_id} upgraded to {plan_type} plan")
            
            return result
            
        except Exception as e:
            logger.error(f"Subscription upgrade payment failed: {e}")
            return PaymentResult(
                success=False,
                error_message=str(e),
                amount=amount,
                currency=currency
            )
    
    @staticmethod
    async def _save_payment_record(
        user_id: str,
        trip_id: Optional[str],
        amount: Decimal,
        currency: str,
        payment_method: PaymentMethod,
        result: PaymentResult
    ):
        """Save payment record to database"""
        try:
            # In a real implementation, this would save to the database
            payment_record = {
                "user_id": user_id,
                "trip_id": trip_id,
                "amount": float(amount),
                "currency": currency,
                "payment_method": payment_method.value,
                "payment_status": result.status.value,
                "transaction_id": result.transaction_id,
                "gateway_response": result.gateway_response,
                "created_at": datetime.utcnow()
            }
            
            logger.info(f"Payment record saved: {payment_record}")
            
        except Exception as e:
            logger.error(f"Failed to save payment record: {e}")


# Webhook handlers for payment notifications
class PaymentWebhookHandler:
    """Handle payment webhooks from payment gateways"""
    
    @staticmethod
    async def handle_stripe_webhook(payload: bytes, signature: str) -> bool:
        """Handle Stripe webhook"""
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            
            # Handle different event types
            if event.type == "payment_intent.succeeded":
                await PaymentWebhookHandler._handle_payment_success(event.data.object)
            elif event.type == "payment_intent.payment_failed":
                await PaymentWebhookHandler._handle_payment_failure(event.data.object)
            elif event.type == "invoice.payment_succeeded":
                await PaymentWebhookHandler._handle_subscription_payment(event.data.object)
            
            return True
            
        except Exception as e:
            logger.error(f"Stripe webhook handling failed: {e}")
            return False
    
    @staticmethod
    async def handle_paypal_webhook(payload: Dict[str, Any]) -> bool:
        """Handle PayPal webhook"""
        try:
            event_type = payload.get("event_type")
            
            if event_type == "PAYMENT.CAPTURE.COMPLETED":
                await PaymentWebhookHandler._handle_paypal_payment_success(payload)
            elif event_type == "PAYMENT.CAPTURE.DENIED":
                await PaymentWebhookHandler._handle_paypal_payment_failure(payload)
            
            return True
            
        except Exception as e:
            logger.error(f"PayPal webhook handling failed: {e}")
            return False
    
    @staticmethod
    async def _handle_payment_success(payment_intent: Dict[str, Any]):
        """Handle successful payment"""
        logger.info(f"Payment succeeded: {payment_intent.id}")
        # Update payment status in database
        # Send confirmation email
        # Update trip status if applicable
    
    @staticmethod
    async def _handle_payment_failure(payment_intent: Dict[str, Any]):
        """Handle failed payment"""
        logger.warning(f"Payment failed: {payment_intent.id}")
        # Update payment status in database
        # Send failure notification
        # Retry logic if applicable
    
    @staticmethod
    async def _handle_subscription_payment(invoice: Dict[str, Any]):
        """Handle subscription payment"""
        logger.info(f"Subscription payment: {invoice.id}")
        # Update subscription status
        # Extend user premium features
    
    @staticmethod
    async def _handle_paypal_payment_success(payload: Dict[str, Any]):
        """Handle successful PayPal payment"""
        logger.info(f"PayPal payment succeeded: {payload.get('resource', {}).get('id')}")
        # Update payment status
        # Process booking confirmation
    
    @staticmethod
    async def _handle_paypal_payment_failure(payload: Dict[str, Any]):
        """Handle failed PayPal payment"""
        logger.warning(f"PayPal payment failed: {payload.get('resource', {}).get('id')}")
        # Update payment status
        # Handle failure


# Utility functions
def format_currency(amount: Decimal, currency: str = "USD") -> str:
    """Format currency amount for display"""
    currency_symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥"
    }
    
    symbol = currency_symbols.get(currency, currency)
    return f"{symbol}{amount:.2f}"


def calculate_tax(amount: Decimal, tax_rate: float = 0.08) -> Decimal:
    """Calculate tax amount"""
    return amount * Decimal(str(tax_rate))


def calculate_total_with_tax(amount: Decimal, tax_rate: float = 0.08) -> Decimal:
    """Calculate total amount including tax"""
    tax = calculate_tax(amount, tax_rate)
    return amount + tax


if __name__ == "__main__":
    # Test the payment system
    async def test_payments():
        print("💳 Testing Payment System...")
        
        # Test trip booking payment
        print("\n🏖️ Testing Trip Booking Payment...")
        booking_result = await PaymentService.book_trip(
            user_id="test_user_123",
            trip_id="trip_456",
            amount=Decimal("299.99"),
            currency="USD",
            payment_method=PaymentMethod.STRIPE
        )
        print(f"Booking Result: {booking_result.success}")
        
        # Test subscription upgrade
        print("\n⭐ Testing Subscription Upgrade...")
        subscription_result = await PaymentService.upgrade_subscription(
            user_id="test_user_123",
            plan_type="premium",
            amount=Decimal("19.99"),
            currency="USD",
            payment_method=PaymentMethod.STRIPE
        )
        print(f"Subscription Result: {subscription_result.success}")
        
        # Test supported payment methods
        print("\n🔧 Testing Supported Payment Methods...")
        supported_methods = payment_manager.get_supported_payment_methods()
        print(f"Supported Methods: {[m.value for m in supported_methods]}")
        
        # Test currency formatting
        print("\n💰 Testing Currency Formatting...")
        amount = Decimal("299.99")
        print(f"USD: {format_currency(amount, 'USD')}")
        print(f"EUR: {format_currency(amount, 'EUR')}")
        print(f"Total with tax: {format_currency(calculate_total_with_tax(amount), 'USD')}")
    
    asyncio.run(test_payments())

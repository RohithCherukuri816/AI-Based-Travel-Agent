import React from 'react';
import '../App.css'; // Assuming App.css contains global styles

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingSummary?: any; // To be populated with actual booking details
  totalAmount?: number; // To be populated with total amount
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingSummary, totalAmount }) => {
  if (!isOpen) return null;

  return (
    <div id="paymentModal" className="modal" style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Complete Your Booking</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="payment-summary">
            <h4>Booking Summary</h4>
            <div className="payment-items" id="paymentItems">
              {/* Payment items will be populated here */}
              {bookingSummary && bookingSummary.items ? (
                bookingSummary.items.map((item: any, index: number) => (
                  <div key={index} className="payment-item">
                    <span>{item.description}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>No booking summary available.</p>
              )}
            </div>
            <div className="payment-total">
              <span>Total:</span>
              <span id="paymentTotal">${totalAmount ? totalAmount.toFixed(2) : '0.00'}</span>
            </div>
          </div>
          
          <div className="payment-methods">
            <h4>Payment Method</h4>
            <div className="payment-options">
              <label className="payment-option">
                <input type="radio" name="paymentMethod" value="stripe" defaultChecked />
                <span className="radio-custom"></span>
                <i className="fab fa-cc-stripe"></i>
                Credit Card
              </label>
              <label className="payment-option">
                <input type="radio" name="paymentMethod" value="paypal" />
                <span className="radio-custom"></span>
                <i className="fab fa-paypal"></i>
                PayPal
              </label>
            </div>
          </div>
          
          <div className="payment-form" id="paymentForm">
            {/* Payment form will be populated here (e.g., Stripe Elements) */}
            <p>Payment form integration goes here.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" id="confirmPaymentBtn">
            <i className="fas fa-lock"></i>
            Pay Securely
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

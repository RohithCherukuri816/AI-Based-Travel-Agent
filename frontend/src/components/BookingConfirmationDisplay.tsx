import React from 'react';

interface BookingConfirmation {
  booking_id: string;
  trip_id: string;
  user_id: string;
  status: string;
  timestamp: string;
  details: {
    booking_type: string;
    provider: string;
    travel_date: string;
    price: number;
    currency: string;
    [key: string]: any; // Allow for other dynamic details
  };
}

interface BookingConfirmationDisplayProps {
  confirmation: BookingConfirmation;
}

const BookingConfirmationDisplay: React.FC<BookingConfirmationDisplayProps> = ({ confirmation }) => {
  const { booking_id, trip_id, status, details } = confirmation;

  return (
    <div className="booking-confirmation-card">
      <h2 className="confirmation-title">Booking Confirmed!</h2>
      <div className="confirmation-details">
        <p><strong>Booking ID:</strong> {booking_id}</p>
        <p><strong>Trip ID:</strong> {trip_id}</p>
        <p><strong>Status:</strong> <span className={`status-${status.toLowerCase()}`}>{status.toUpperCase()}</span></p>
        <p><strong>Booking Type:</strong> {details.booking_type}</p>
        <p><strong>Provider:</strong> {details.provider}</p>
        <p><strong>Travel Date:</strong> {new Date(details.travel_date).toLocaleDateString()}</p>
        <p><strong>Price:</strong> {details.price.toFixed(2)} {details.currency}</p>
        {/* Add more details dynamically if needed */}
        {details.flight_number && <p><strong>Flight Number:</strong> {details.flight_number}</p>}
        {details.hotel_name && <p><strong>Hotel:</strong> {details.hotel_name}</p>}
      </div>
      <p className="confirmation-message">Thank you for booking with TravelBot! We look forward to your trip.</p>
    </div>
  );
};

export default BookingConfirmationDisplay;

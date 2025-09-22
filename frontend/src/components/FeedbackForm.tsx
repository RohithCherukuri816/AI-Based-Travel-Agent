import React, { useState } from 'react';

interface FeedbackFormProps {
  onSubmitFeedback: (rating: number, comments: string) => void;
  tripId: string; // Assuming we know which trip the feedback is for
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmitFeedback, tripId }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmitFeedback(rating, comments);
      setSubmitted(true);
    } else {
      alert("Please provide a rating (1-5 stars).");
    }
  };

  if (submitted) {
    return (
      <div className="feedback-form-card feedback-submitted">
        <h2>Thank You for Your Feedback!</h2>
        <p>Your review for Trip ID: {tripId} has been submitted successfully.</p>
        <p>We appreciate your input!</p>
      </div>
    );
  }

  return (
    <div className="feedback-form-card">
      <h2>Share Your Trip Experience!</h2>
      <p className="feedback-subtitle">Help us personalize your future adventures. Trip ID: {tripId}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Overall Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="comments">Comments (optional):</label>
          <textarea
            id="comments"
            rows={5}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us about your experience..."
          ></textarea>
        </div>
        <button type="submit" className="submit-feedback-button">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

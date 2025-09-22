import React, { useState } from 'react';

interface TravelFormProps {
  onSubmitPreferences: (preferences: { [key: string]: string | number | string[] }) => void;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmitPreferences }) => {
  const [destination, setDestination] = useState('');
  const [destinationType, setDestinationType] = useState<string[]>([]); // Allow multiple selections
  const [purpose, setPurpose] = useState<string[]>([]); // Allow multiple selections
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [budget, setBudget] = useState(''); // Single selection for budget tier
  const [accommodationType, setAccommodationType] = useState<string[]>([]); // Allow multiple selections
  const [transportMode, setTransportMode] = useState<string[]>([]); // Allow multiple selections
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [specialNeedsInput, setSpecialNeedsInput] = useState('');

  // Options for interactive selection
  const destinationTypeOptions = ['Beach', 'Mountains', 'Cultural', 'Adventure', 'Relaxation', 'City', 'Wildlife'];
  const purposeOptions = ['Honeymoon', 'Family Vacation', 'Business', 'Leisure', 'Solo Adventure', 'Romantic', 'Friends Trip'];
  const budgetOptions = ['Budget', 'Standard', 'Luxury']; // Matches backend tiers
  const accommodationOptions = ['Hotel', 'Resort', 'Hostel', 'Airbnb', 'Guesthouse', 'Villa', 'Camping'];
  const transportModeOptions = ['Flight', 'Train', 'Car', 'Bus', 'Cruise', 'Bike'];

  // Helper to handle multiple selections (chips)
  const handleMultiSelectChange = (
    currentSelection: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter((item) => item !== value));
    } else {
      setSelection([...currentSelection, value]);
    }
  };

  // Helper to handle single selection (e.g., for budget)
  const handleSingleSelectChange = (
    setSelection: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setSelection(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPreferences({
      destination,
      destinationType: destinationType.join(', '), // Convert array to comma-separated string
      purpose: purpose.join(', '), // Convert array to comma-separated string
      startDate,
      endDate,
      numTravelers,
      budget,
      accommodationType: accommodationType.join(', '), // Convert array to comma-separated string
      transportMode: transportMode.join(', '), // Convert array to comma-separated string
      specialNeeds,
    });
  };

  const handleAddSpecialNeed = () => {
    if (specialNeedsInput.trim() && !specialNeeds.includes(specialNeedsInput.trim())) {
      setSpecialNeeds([...specialNeeds, specialNeedsInput.trim()]);
      setSpecialNeedsInput('');
    }
  };

  const handleRemoveSpecialNeed = (needToRemove: string) => {
    setSpecialNeeds(specialNeeds.filter(need => need !== needToRemove));
  };

  return (
    <form className="travel-form" onSubmit={handleSubmit}>
      <h2>Plan Your Trip!</h2>
      <div className="form-group">
        <label>Destination:</label>
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Paris, Japan" required />
      </div>

      <div className="form-group">
        <label>Destination Type:</label>
        <div className="chip-container">
          {destinationTypeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${destinationType.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelectChange(destinationType, setDestinationType, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Purpose of Trip:</label>
        <div className="chip-container">
          {purposeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${purpose.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelectChange(purpose, setPurpose, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Number of Travelers:</label>
        <input type="number" value={numTravelers} onChange={(e) => setNumTravelers(parseInt(e.target.value))} min="1" />
      </div>

      <div className="form-group">
        <label>Budget:</label>
        <div className="chip-container">
          {budgetOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${budget === option ? 'selected' : ''}`}
              onClick={() => handleSingleSelectChange(setBudget, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Accommodation Type:</label>
        <div className="chip-container">
          {accommodationOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${accommodationType.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelectChange(accommodationType, setAccommodationType, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Transport Mode:</label>
        <div className="chip-container">
          {transportModeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${transportMode.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelectChange(transportMode, setTransportMode, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Special Needs/Interests:</label>
        <div className="special-needs-input">
          <input
            type="text"
            value={specialNeedsInput}
            onChange={(e) => setSpecialNeedsInput(e.target.value)}
            placeholder="Add a special need or interest"
          />
          <button type="button" onClick={handleAddSpecialNeed}>Add</button>
        </div>
        <ul className="special-needs-list">
          {specialNeeds.map((need, index) => (
            <li key={index}>
              {need}
              <button type="button" onClick={() => handleRemoveSpecialNeed(need)}>x</button>
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" className="submit-button">Plan My Trip!</button>
    </form>
  );
};

export default TravelForm;

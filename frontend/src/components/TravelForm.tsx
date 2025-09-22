import React, { useState } from 'react';

interface TravelFormProps {
  onSubmitPreferences: (preferences: { [key: string]: string | number | string[] }) => void;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmitPreferences }) => {
  const [destination, setDestination] = useState('');
  const [destinationType, setDestinationType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [budget, setBudget] = useState('');
  const [accommodationType, setAccommodationType] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [specialNeedsInput, setSpecialNeedsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPreferences({
      destination,
      destinationType,
      purpose,
      startDate,
      endDate,
      numTravelers,
      budget,
      accommodationType,
      transportMode,
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
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Destination Type (e.g., beach, mountains):</label>
        <input type="text" value={destinationType} onChange={(e) => setDestinationType(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Purpose of Trip (e.g., honeymoon, leisure):</label>
        <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
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
        <label>Budget (e.g., low, medium, high, or specific amount):</label>
        <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Accommodation Type (e.g., hotel, resort):</label>
        <input type="text" value={accommodationType} onChange={(e) => setAccommodationType(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Transport Mode (e.g., flight, train):</label>
        <input type="text" value={transportMode} onChange={(e) => setTransportMode(e.target.value)} />
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

import React, { useState } from 'react';

import './TravelForm.css';

const Card = ({ value, icon, onClick, isSelected }: { value: string; icon: string; onClick: () => void; isSelected: boolean }) => (
  <button
    type="button"
    className={`card-item ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <i className={`card-icon ${icon}`}></i>
    <span className="card-label">{value}</span>
    {isSelected && <i className="fas fa-check-circle selected-check"></i>}
  </button>
);

interface TravelFormProps {
  onSubmitPreferences: (preferences: { [key: string]: string | number | string[] }) => void;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmitPreferences }) => {
  const [destination, setDestination] = useState('');
  const [destinationType, setDestinationType] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [budget, setBudget] = useState('');
  const [accommodationType, setAccommodationType] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [specialNeedsInput, setSpecialNeedsInput] = useState('');

  const destinationTypeOptions = [
    { value: 'Beach', icon: 'fas fa-umbrella-beach' },
    { value: 'Mountains', icon: 'fas fa-mountain' },
    { value: 'Cultural', icon: 'fas fa-landmark' },
    { value: 'Adventure', icon: 'fas fa-hiking' },
    { value: 'Relaxation', icon: 'fas fa-spa' },
    { value: 'City', icon: 'fas fa-city' },
    { value: 'Wildlife', icon: 'fas fa-paw' }
  ];
  const purposeOptions = [
    { value: 'Honeymoon', icon: 'fas fa-heart' },
    { value: 'Family Vacation', icon: 'fas fa-users' },
    { value: 'Business', icon: 'fas fa-briefcase' },
    { value: 'Leisure', icon: 'fas fa-plane-departure' },
    { value: 'Solo Adventure', icon: 'fas fa-user-circle' },
    { value: 'Romantic', icon: 'fas fa-moon' },
    { value: 'Friends Trip', icon: 'fas fa-user-friends' }
  ];
  const budgetOptions = [
    { value: 'Budget', icon: 'fas fa-wallet' },
    { value: 'Standard', icon: 'fas fa-dollar-sign' },
    { value: 'Luxury', icon: 'fas fa-gem' }
  ];
  const accommodationOptions = [
    { value: 'Hotel', icon: 'fas fa-hotel' },
    { value: 'Resort', icon: 'fas fa-house-user' },
    { value: 'Hostel', icon: 'fas fa-bed' },
    { value: 'Airbnb', icon: 'fas fa-home' },
    { value: 'Guesthouse', icon: 'fas fa-house' },
    { value: 'Villa', icon: 'fas fa-building' },
    { value: 'Camping', icon: 'fas fa-campground' }
  ];
  const transportModeOptions = [
    { value: 'Flight', icon: 'fas fa-plane' },
    { value: 'Train', icon: 'fas fa-train' },
    { value: 'Car', icon: 'fas fa-car' },
    { value: 'Bus', icon: 'fas fa-bus' },
    { value: 'Cruise', icon: 'fas fa-ship' },
    { value: 'Bike', icon: 'fas fa-bicycle' }
  ];

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
      destinationType: destinationType.join(', '),
      purpose: purpose.join(', '),
      startDate,
      endDate,
      numTravelers,
      budget,
      accommodationType: accommodationType.join(', '),
      transportMode: transportMode.join(', '),
      specialNeeds: specialNeeds.join(', '),
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
    <>

      <div className="travel-form-container">
        <h2 className="form-title">Plan Your Trip!</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>

          <div className="form-section">
            <label className="form-label">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, Japan"
              className="form-input"
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">Destination Type</label>
            <div className="card-grid">
              {destinationTypeOptions.map((option) => (
                <Card
                  key={option.value}
                  value={option.value}
                  icon={option.icon}
                  onClick={() => handleMultiSelectChange(destinationType, setDestinationType, option.value)}
                  isSelected={destinationType.includes(option.value)}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Purpose of Trip</label>
            <div className="card-grid">
              {purposeOptions.map((option) => (
                <Card
                  key={option.value}
                  value={option.value}
                  icon={option.icon}
                  onClick={() => handleMultiSelectChange(purpose, setPurpose, option.value)}
                  isSelected={purpose.includes(option.value)}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Dates</label>
            <div className="dates-container">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="form-input"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
                className="form-input"
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Number of Travelers</label>
            <input type="number" value={numTravelers} onChange={(e) => setNumTravelers(parseInt(e.target.value))} min="1" className="form-input" />
          </div>

          <div className="form-section">
            <label className="form-label">Budget</label>
            <div className="card-grid">
              {budgetOptions.map((option) => (
                <Card
                  key={option.value}
                  value={option.value}
                  icon={option.icon}
                  onClick={() => handleSingleSelectChange(setBudget, option.value)}
                  isSelected={budget === option.value}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Accommodation Type</label>
            <div className="card-grid">
              {accommodationOptions.map((option) => (
                <Card
                  key={option.value}
                  value={option.value}
                  icon={option.icon}
                  onClick={() => handleMultiSelectChange(accommodationType, setAccommodationType, option.value)}
                  isSelected={accommodationType.includes(option.value)}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Transport Mode</label>
            <div className="card-grid">
              {transportModeOptions.map((option) => (
                <Card
                  key={option.value}
                  value={option.value}
                  icon={option.icon}
                  onClick={() => handleMultiSelectChange(transportMode, setTransportMode, option.value)}
                  isSelected={transportMode.includes(option.value)}
                />
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Special Needs/Interests</label>
            <div className="special-needs-input-group">
              <input
                type="text"
                value={specialNeedsInput}
                onChange={(e) => setSpecialNeedsInput(e.target.value)}
                placeholder="Add a special need or interest"
                className="form-input"
              />
              <button type="button" className="add-button" onClick={handleAddSpecialNeed}>Add</button>
            </div>
            <ul className="special-needs-list">
              {specialNeeds.map((need, index) => (
                <li key={index} className="special-need-tag">
                  {need}
                  <button type="button" className="special-need-tag-remove" onClick={() => handleRemoveSpecialNeed(need)}>&times;</button>
                </li>
              ))}
            </ul>
          </div>

          <button type="submit" className="submit-button">
            <i className="fas fa-magic"></i> Plan My Trip!
          </button>
        </form>
      </div>
    </>
  );
};

export default TravelForm;
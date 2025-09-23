import React, { useState } from 'react';

// Combined styles for a single file solution
const formStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
  
  :root {
    --primary-color: #6a0dad;
    --primary-light: #9d4edd;
    --background-color: #f5f5f5;
    --card-bg: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0, 0, 0, 0.05);
  }

  .travel-form-container {
    width: 100%;
    max-width: 900px; /* Constrain max width for aesthetics on very large screens */
    margin: 2rem auto;
    background: var(--background-color);
    font-family: 'Poppins', sans-serif;
    color: var(--text-color);
    padding: 3rem;
    border-radius: 1.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }

  .form-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
  }
  .form-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: var(--primary-light);
    border-radius: 2px;
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .form-label {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: 0.75rem;
    font-size: 1rem;
    background: var(--card-bg);
    transition: all 0.3s ease-in-out;
  }
  .form-input:focus {
    outline: none;
    border-color: var(--primary-light);
    box-shadow: 0 0 0 4px rgba(106, 13, 173, 0.1);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .card-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem;
    background: var(--card-bg);
    border-radius: 1rem;
    box-shadow: 0 4px 12px var(--shadow-color);
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    text-align: center;
  }
  .card-item:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-light);
  }
  .card-item.selected {
    border-color: var(--primary-color);
    background: linear-gradient(145deg, var(--primary-color), var(--primary-light));
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    color: var(--primary-color);
    transition: color 0.3s ease-in-out;
  }
  .card-item.selected .card-icon {
    color: #fff;
  }

  .card-label {
    font-weight: 500;
  }

  .selected-check {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.5rem;
    color: #fff;
  }

  .special-needs-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .add-button {
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: #fff;
    border-radius: 0.75rem;
    font-weight: 600;
    transition: background-color 0.3s;
  }
  .add-button:hover {
    background: var(--primary-light);
  }

  .special-needs-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    list-style: none;
    padding: 0;
    margin-top: 1rem;
  }

  .special-need-tag {
    background: var(--primary-light);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .special-need-tag-remove {
    background: transparent;
    color: #fff;
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.3s;
  }
  .special-need-tag-remove:hover {
    opacity: 1;
  }

  .submit-button {
    width: 100%;
    padding: 1rem;
    border-radius: 1rem;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
    color: #fff;
    font-size: 1.25rem;
    font-weight: 700;
    box-shadow: 0 4px 20px rgba(106, 13, 173, 0.4);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .submit-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(106, 13, 173, 0.6);
  }
`;

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
      <style>{formStyles}</style>
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
            <div className="flex space-x-4">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="form-input" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="form-input" />
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

          <button type="submit" className="submit-button">Plan My Trip!</button>
        </form>
      </div>
    </>
  );
};

export default TravelForm;

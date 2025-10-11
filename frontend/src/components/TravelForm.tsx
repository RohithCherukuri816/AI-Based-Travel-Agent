import React, { useState } from 'react';

// Updated dark theme styles
const formStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
  
  :root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --dark-bg: #0f0f23;
    --card-bg: rgba(255, 255, 255, 0.03);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: rgba(255, 255, 255, 0.1);
  }

  .travel-form-container {
    width: 100%;
    max-width: 900px;
    margin: 2rem auto;
    background: transparent;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    padding: 0;
  }

  .form-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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
    background: var(--primary-gradient);
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
    color: var(--text-primary);
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    font-size: 1rem;
    background: var(--card-bg);
    color: var(--text-primary);
    transition: all 0.3s ease-in-out;
    backdrop-filter: blur(10px);
  }
  .form-input:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-input::placeholder {
    color: var(--text-secondary);
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
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    text-align: center;
    backdrop-filter: blur(10px);
  }
  .card-item:hover {
    transform: translateY(-5px);
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(102, 126, 234, 0.05);
  }
  .card-item.selected {
    border-color: rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    transform: scale(1.02);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: all 0.3s ease-in-out;
  }
  .card-item.selected .card-icon {
    color: #fff;
    -webkit-text-fill-color: #fff;
  }

  .card-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .selected-check {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.5rem;
    color: #4CAF50;
  }

  .special-needs-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .add-button {
    padding: 0.75rem 1.5rem;
    background: var(--primary-gradient);
    color: #fff;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s;
    white-space: nowrap;
  }
  .add-button:hover {
    transform: translateY(-2px);
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
    background: rgba(79, 172, 254, 0.1);
    color: var(--text-primary);
    padding: 0.5rem 1rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid rgba(79, 172, 254, 0.3);
  }
  .special-need-tag-remove {
    background: transparent;
    color: var(--text-primary);
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.3s;
    border: none;
    cursor: pointer;
  }
  .special-need-tag-remove:hover {
    opacity: 1;
  }

  .submit-button {
    width: 100%;
    padding: 1.2rem;
    border-radius: 1rem;
    background: var(--primary-gradient);
    color: #fff;
    font-size: 1.25rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: transform 0.3s;
    margin-top: 2rem;
  }
  .submit-button:hover {
    transform: translateY(-3px);
  }

  .dates-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .travel-form-container {
      margin: 1rem auto;
      padding: 0;
    }
    
    .form-title {
      font-size: 2rem;
    }
    
    .card-grid {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
    
    .dates-container {
      grid-template-columns: 1fr;
    }
    
    .special-needs-input-group {
      flex-direction: column;
    }
    
    .add-button {
      width: 100%;
    }
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
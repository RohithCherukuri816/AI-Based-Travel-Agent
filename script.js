/**
 * AI Travel Planning Agent - Frontend JavaScript
 * Handles form submission, API calls, and dynamic content rendering
 */

// Global variables
let currentItinerary = null;

// DOM elements
const travelForm = document.getElementById('travelForm');
const submitBtn = document.getElementById('submitBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const tripSummary = document.getElementById('tripSummary');
const itineraryContainer = document.getElementById('itineraryContainer');
const recommendationsList = document.getElementById('recommendationsList');
const errorMessage = document.getElementById('errorMessage');

// API configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
    plan: '/api/plan',
    health: '/api/health',
    destinations: '/api/destinations'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setDefaultDate();
    checkAPIHealth();
});

/**
 * Initialize form event listeners and validation
 */
function initializeForm() {
    travelForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = travelForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Add preference selection handling
    const preferenceItems = document.querySelectorAll('.preference-item');
    preferenceItems.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        });
    });
}

/**
 * Set default start date to tomorrow
 */
function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDateInput = document.getElementById('startDate');
    startDateInput.value = tomorrow.toISOString().split('T')[0];
    startDateInput.min = tomorrow.toISOString().split('T')[0];
}

/**
 * Check if the backend API is healthy
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
        if (!response.ok) {
            console.warn('Backend API is not responding');
        }
    } catch (error) {
        console.warn('Cannot connect to backend API:', error);
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(travelForm);
    const travelRequest = {
        destination: formData.get('destination'),
        start_date: formData.get('startDate'),
        duration: parseInt(formData.get('duration')),
        budget: parseFloat(formData.get('budget')),
        preferences: getSelectedPreferences(),
        travelers: parseInt(formData.get('travelers')),
        travel_style: formData.get('travelStyle')
    };
    
    // Show loading state
    showLoading();
    
    try {
        const response = await planTravel(travelRequest);
        showResults(response);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Get selected preferences from checkboxes
 */
function getSelectedPreferences() {
    const preferences = [];
    const checkboxes = document.querySelectorAll('input[name="preferences"]:checked');
    checkboxes.forEach(checkbox => {
        preferences.push(checkbox.value);
    });
    return preferences;
}

/**
 * Validate the entire form
 */
function validateForm() {
    let isValid = true;
    const requiredFields = travelForm.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField.call(field)) {
            isValid = false;
        }
    });
    
    // Check if at least one preference is selected
    const preferences = getSelectedPreferences();
    if (preferences.length === 0) {
        showFieldError('preferences', 'Please select at least one preference');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField() {
    const field = this;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Clear previous error
    clearFieldError.call(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(fieldName, 'This field is required');
        return false;
    }
    
    // Specific validation rules
    switch (fieldName) {
        case 'destination':
            if (value.length < 2) {
                showFieldError(fieldName, 'Destination must be at least 2 characters');
                return false;
            }
            break;
        case 'budget':
            if (parseFloat(value) < 500) {
                showFieldError(fieldName, 'Budget must be at least $500');
                return false;
            }
            break;
        case 'duration':
            if (parseInt(value) < 1 || parseInt(value) > 30) {
                showFieldError(fieldName, 'Duration must be between 1 and 30 days');
                return false;
            }
            break;
    }
    
    return true;
}

/**
 * Show field error
 */
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('error');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.color = '#e53e3e';
            errorElement.style.fontSize = '0.85rem';
            errorElement.style.marginTop = '4px';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
}

/**
 * Clear field error
 */
function clearFieldError() {
    const field = this;
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Show loading state
 */
function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Planning...';
}

/**
 * Hide all sections
 */
function hideAllSections() {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

/**
 * Plan travel using the backend API
 */
async function planTravel(travelRequest) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.plan}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(travelRequest)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to plan travel');
    }
    
    return await response.json();
}

/**
 * Show travel results
 */
function showResults(response) {
    currentItinerary = response;
    
    // Hide loading and show results
    hideAllSections();
    resultsSection.style.display = 'block';
    
    // Reset form button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Plan My Trip';
    
    // Display trip summary
    displayTripSummary(response);
    
    // Display itinerary
    displayItinerary(response.itinerary);
    
    // Display recommendations
    displayRecommendations(response.recommendations);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display trip summary
 */
function displayTripSummary(response) {
    tripSummary.innerHTML = `
        <div class="summary-content">
            <div class="summary-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>Destination:</strong> ${response.itinerary[0]?.destination || 'Unknown'}</span>
            </div>
            <div class="summary-item">
                <i class="fas fa-calendar"></i>
                <span><strong>Duration:</strong> ${response.itinerary.length} days</span>
            </div>
            <div class="summary-item">
                <i class="fas fa-dollar-sign"></i>
                <span><strong>Total Cost:</strong> $${response.total_cost.toFixed(2)}</span>
            </div>
        </div>
    `;
}

/**
 * Display day-by-day itinerary
 */
function displayItinerary(itinerary) {
    itineraryContainer.innerHTML = '';
    
    itinerary.forEach(day => {
        const dayCard = createDayCard(day);
        itineraryContainer.appendChild(dayCard);
    });
}

/**
 * Create a day card element
 */
function createDayCard(day) {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    
    // Weather icon mapping
    const weatherIcon = getWeatherIcon(day.weather?.condition);
    
    dayCard.innerHTML = `
        <div class="day-header">
            <div class="day-title">Day ${day.day}</div>
            <div class="day-date">${formatDate(day.date)}</div>
        </div>
        
        <div class="weather-info">
            <i class="${weatherIcon}"></i>
            <div class="weather-details">
                <strong>${day.weather?.condition || 'Unknown'}</strong>
                ${day.weather?.temperature ? ` • ${day.weather.temperature}°C` : ''}
                ${day.weather?.precipitation ? ` • ${day.weather.precipitation}% rain` : ''}
            </div>
        </div>
        
        ${createScheduleSection('Morning', day.morning, 'fas fa-sun')}
        ${createScheduleSection('Afternoon', day.afternoon, 'fas fa-cloud-sun')}
        ${createScheduleSection('Evening', day.evening, 'fas fa-moon')}
        
        ${day.travel_tips && day.travel_tips.length > 0 ? createTravelTips(day.travel_tips) : ''}
    `;
    
    return dayCard;
}

/**
 * Create schedule section for a time period
 */
function createScheduleSection(title, activities, icon) {
    if (!activities || activities.length === 0) {
        return '';
    }
    
    const activitiesHtml = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-name">${activity.name}</div>
            <div class="activity-details">
                ${activity.description || ''}
                ${activity.duration ? ` • ${activity.duration}` : ''}
            </div>
            ${activity.price ? `<div class="activity-price">$${activity.price}</div>` : ''}
        </div>
    `).join('');
    
    return `
        <div class="schedule-section">
            <div class="schedule-title">
                <i class="${icon}"></i>
                ${title}
            </div>
            ${activitiesHtml}
        </div>
    `;
}

/**
 * Create travel tips section
 */
function createTravelTips(tips) {
    if (!tips || tips.length === 0) {
        return '';
    }
    
    const tipsHtml = tips.map(tip => `<li>${tip}</li>`).join('');
    
    return `
        <div class="travel-tips">
            <h4><i class="fas fa-exclamation-triangle"></i> Travel Tips</h4>
            <ul>${tipsHtml}</ul>
        </div>
    `;
}

/**
 * Get weather icon based on condition
 */
function getWeatherIcon(condition) {
    if (!condition) return 'fas fa-question';
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny')) return 'fas fa-sun';
    if (conditionLower.includes('cloudy')) return 'fas fa-cloud';
    if (conditionLower.includes('rainy') || conditionLower.includes('rain')) return 'fas fa-cloud-rain';
    if (conditionLower.includes('snow')) return 'fas fa-snowflake';
    if (conditionLower.includes('storm')) return 'fas fa-bolt';
    
    return 'fas fa-cloud-sun';
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        recommendationsList.innerHTML = '<p>No specific recommendations at this time.</p>';
        return;
    }
    
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <i class="fas fa-lightbulb"></i>
            ${rec}
        </div>
    `).join('');
}

/**
 * Show error message
 */
function showError(message) {
    hideAllSections();
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
    
    // Reset form button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Plan My Trip';
}

/**
 * Reset the form and show planning form
 */
function resetForm() {
    // Reset form
    travelForm.reset();
    setDefaultDate();
    
    // Clear any error states
    const inputs = travelForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    });
    
    // Clear preference selections
    const preferenceItems = document.querySelectorAll('.preference-item');
    preferenceItems.forEach(item => {
        item.classList.remove('selected');
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = false;
    });
    
    // Hide all sections and show form
    hideAllSections();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Export itinerary to PDF (placeholder for future implementation)
 */
function exportItinerary() {
    // This would integrate with a PDF library like jsPDF
    alert('PDF export feature coming soon!');
}

/**
 * Share itinerary (placeholder for future implementation)
 */
function shareItinerary() {
    // This would integrate with Web Share API or social media
    if (navigator.share) {
        navigator.share({
            title: 'My Travel Itinerary',
            text: 'Check out my amazing travel plan!',
            url: window.location.href
        });
    } else {
        alert('Sharing feature coming soon!');
    }
}

// Add some utility functions for debugging
window.debugItinerary = function() {
    console.log('Current Itinerary:', currentItinerary);
};

window.testAPI = async function() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
        const data = await response.json();
        console.log('API Health Check:', data);
    } catch (error) {
        console.error('API Test Failed:', error);
    }
};

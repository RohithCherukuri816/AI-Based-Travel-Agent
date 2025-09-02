/**
 * AI Travel Planning Agent - Enhanced JavaScript
 * Next-level functionality with AI chat, analytics, and payments
 */

// Global configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_key_here',
    CHAT_UPDATE_INTERVAL: 1000,
    ANALYTICS_UPDATE_INTERVAL: 5000,
    MAX_CHAT_MESSAGES: 100
};

// Global state
const STATE = {
    currentUser: null,
    chatSession: null,
    currentTrip: null,
    analyticsData: null,
    paymentIntent: null,
    isProcessing: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('🚀 Initializing AI Travel Agent...');
    
    // Initialize components
    initializeNavigation();
    initializeChat();
    initializePlanningForm();
    initializeAnalytics();
    initializePaymentSystem();
    initializeEventListeners();
    
    // Set default date
    setDefaultDate();
    
    // Check API health
    checkAPIHealth();
    
    console.log('✅ Application initialized successfully');
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

/**
 * Initialize AI chat functionality
 */
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatInput && sendMessageBtn) {
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        // Send message on button click
        sendMessageBtn.addEventListener('click', sendChatMessage);
        
        // Auto-resize input
        chatInput.addEventListener('input', autoResizeInput);
    }
    
    // Initialize suggestion buttons
    initializeChatSuggestions();
    
    // Start chat session
    startChatSession();
}

/**
 * Initialize chat suggestion buttons
 */
function initializeChatSuggestions() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            const message = e.target.textContent;
            document.getElementById('chatInput').value = message;
            sendChatMessage();
        }
    });
}

/**
 * Send a chat message
 */
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || STATE.isProcessing) return;
    
    // Add user message to chat
    addChatMessage('user', message);
    
    // Clear input
    chatInput.value = '';
    autoResizeInput();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        STATE.isProcessing = true;
        
        // Send message to AI
        const response = await sendMessageToAI(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        if (response.success) {
            addChatMessage('ai', response.response.content, response.response.suggestions);
        } else {
            addChatMessage('ai', 'I apologize, but I encountered an error. Please try again.');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addChatMessage('ai', 'I apologize, but I\'m having trouble connecting right now. Please try again later.');
    } finally {
        STATE.isProcessing = false;
    }
}

/**
 * Add a message to the chat
 */
function addChatMessage(type, content, suggestions = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<i class="fas fa-${type === 'ai' ? 'robot' : 'user'}"></i>`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('p');
    messageText.textContent = content;
    messageContent.appendChild(messageText);
    
    // Add suggestions if provided
    if (suggestions && suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'message-suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.textContent = suggestion;
            suggestionsDiv.appendChild(suggestionBtn);
        });
        
        messageContent.appendChild(suggestionsDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Limit messages
    limitChatMessages();
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Limit chat messages to prevent memory issues
 */
function limitChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    const messages = chatMessages.querySelectorAll('.message');
    
    if (messages.length > CONFIG.MAX_CHAT_MESSAGES) {
        const messagesToRemove = messages.length - CONFIG.MAX_CHAT_MESSAGES;
        for (let i = 0; i < messagesToRemove; i++) {
            messages[i].remove();
        }
    }
}

/**
 * Auto-resize chat input
 */
function autoResizeInput() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    }
}

/**
 * Start a new chat session
 */
async function startChatSession() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 'anonymous',
                trip_id: null
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            STATE.chatSession = data.session_id;
            console.log('Chat session started:', STATE.chatSession);
        }
    } catch (error) {
        console.error('Failed to start chat session:', error);
    }
}

/**
 * Send message to AI backend
 */
async function sendMessageToAI(message) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 'anonymous',
            message: message,
            session_id: STATE.chatSession
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

/**
 * Initialize trip planning form
 */
function initializePlanningForm() {
    const form = document.getElementById('advancedTravelForm');
    const startPlanningBtn = document.getElementById('startPlanningBtn');
    
    if (form) {
        form.addEventListener('submit', handleTripPlanning);
    }
    
    if (startPlanningBtn) {
        startPlanningBtn.addEventListener('click', () => {
            document.getElementById('planning').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Initialize form interactions
    initializeFormInteractions();
}

/**
 * Initialize form interactions
 */
function initializeFormInteractions() {
    // Traveler count buttons
    document.querySelectorAll('.traveler-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const input = document.getElementById('travelers');
            let value = parseInt(input.value);
            
            if (action === 'increase' && value < 10) {
                value++;
            } else if (action === 'decrease' && value > 1) {
                value--;
            }
            
            input.value = value;
        });
    });
    
    // Destination suggestions
    const destinationInput = document.getElementById('destination');
    if (destinationInput) {
        destinationInput.addEventListener('input', debounce(handleDestinationInput, 300));
    }
    
    // Save preferences button
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveUserPreferences);
    }
}

/**
 * Handle destination input for suggestions
 */
async function handleDestinationInput(e) {
    const query = e.target.value.trim();
    const suggestionsDiv = document.getElementById('destinationSuggestions');
    
    if (query.length < 2) {
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/places/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const places = await response.json();
            displayDestinationSuggestions(places);
        }
    } catch (error) {
        console.error('Failed to fetch destination suggestions:', error);
    }
}

/**
 * Display destination suggestions
 */
function displayDestinationSuggestions(places) {
    const suggestionsDiv = document.getElementById('destinationSuggestions');
    
    if (places.length === 0) {
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'suggestions-list';
    
    places.slice(0, 5).forEach(place => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = place.name;
        suggestionItem.addEventListener('click', () => {
            document.getElementById('destination').value = place.name;
            suggestionsDiv.innerHTML = '';
        });
        suggestionsList.appendChild(suggestionItem);
    });
    
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.appendChild(suggestionsList);
}

/**
 * Handle trip planning form submission
 */
async function handleTripPlanning(e) {
    e.preventDefault();
    
    if (STATE.isProcessing) return;
    
    // Validate form
    if (!validateAdvancedForm()) {
        return;
    }
    
    // Collect form data
    const formData = new FormData(e.target);
    const tripRequest = {
        destination: formData.get('destination'),
        startDate: formData.get('startDate'),
        duration: parseInt(formData.get('duration')),
        budgetMin: parseFloat(formData.get('budgetMin')) || 0,
        budgetMax: parseFloat(formData.get('budgetMax')) || 10000,
        travelers: parseInt(formData.get('travelers')),
        travelStyle: formData.get('travelStyle'),
        preferences: Array.from(formData.getAll('preferences')),
        accommodationType: formData.get('accommodationType'),
        transportation: formData.get('transportation'),
        accessibility: formData.get('accessibility'),
        language: formData.get('language')
    };
    
    // Show loading
    showLoading();
    
    try {
        STATE.isProcessing = true;
        
        // Plan trip
        const api = await planTrip(tripRequest);
        // Transform backend TravelResponse into UI shape
        const uiTrip = {
            destination: tripRequest.destination,
            startDate: tripRequest.startDate,
            duration: tripRequest.duration,
            travelers: tripRequest.travelers,
            travelStyle: tripRequest.travelStyle,
            itinerary: (api.itinerary || []).map((d) => `${d.date || ''}: ${[...(d.morning||[]), ...(d.afternoon||[]), ...(d.evening||[])].map(a=>a.name||a.title||'Activity').join(', ')}`),
            recommendations: (api.recommendations || []).map((r) => ({
                type: 'activity',
                title: typeof r === 'string' ? r : (r.title || 'Recommendation'),
                description: typeof r === 'string' ? '' : (r.description || ''),
                rating: (r.rating || 4.5),
                price: (r.price || 0)
            })),
            pricing: {
                flights: Math.round((api.total_cost || 0) * 0.4),
                accommodation: Math.round((api.total_cost || 0) * 0.4),
                activities: Math.round((api.total_cost || 0) * 0.2),
                transportation: 0,
                total: Math.round(api.total_cost || 0)
            }
        };
        STATE.currentTrip = uiTrip;
        showResults(uiTrip);
        
    } catch (error) {
        console.error('Trip planning error:', error);
        showError('An unexpected error occurred. Please try again.');
    } finally {
        STATE.isProcessing = false;
        hideLoading();
    }
}

/**
 * Validate advanced form
 */
function validateAdvancedForm() {
    const form = document.getElementById('advancedTravelForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Validate budget range
    const budgetMin = parseFloat(document.getElementById('budgetMin').value) || 0;
    const budgetMax = parseFloat(document.getElementById('budgetMax').value) || 0;
    
    if (budgetMax > 0 && budgetMin > budgetMax) {
        showFieldError(document.getElementById('budgetMax'), 'Maximum budget must be greater than minimum');
        isValid = false;
    }
    
    // Validate preferences
    const preferences = document.querySelectorAll('input[name="preferences"]:checked');
    if (preferences.length === 0) {
        showError('Please select at least one preference');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

/**
 * Plan trip with backend
 */
async function planTrip(tripRequest) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripRequest)
    });
    
    if (!response.ok) {
        let message = 'Failed to plan trip';
        try { const errorData = await response.json(); message = errorData.detail || message; } catch {}
        throw new Error(message);
    }
    
    return await response.json();
}

/**
 * Show loading section
 */
function showLoading() {
    hideAllSections();
    document.getElementById('loading').classList.remove('hidden');
    
    // Start progress animation
    startProgressAnimation();
}

/**
 * Hide loading section
 */
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

/**
 * Start progress animation
 */
function startProgressAnimation() {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    let currentStep = 1;
    
    const progressInterval = setInterval(() => {
        const progress = (currentStep / 6) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Update step status
        steps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        currentStep++;
        
        if (currentStep > 6) {
            clearInterval(progressInterval);
        }
    }, 1000);
}

/**
 * Show results section
 */
function showResults(tripData) {
    hideAllSections();
    
    // Populate trip summary
    displayTripSummary(tripData);
    
    // Populate itinerary
    displayItinerary(tripData.itinerary);
    
    // Populate recommendations
    displayRecommendations(tripData.recommendations);
    
    // Populate pricing
    displayPricing(tripData.pricing);
    
    // Show results
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display trip summary
 */
function displayTripSummary(tripData) {
    const summaryDiv = document.getElementById('tripSummary');
    
    summaryDiv.innerHTML = `
        <h3>${tripData.destination} - ${tripData.duration} Days</h3>
        <p>${tripData.startDate} • ${tripData.travelers} Traveler${tripData.travelers > 1 ? 's' : ''} • ${tripData.travelStyle} Style</p>
        <div class="trip-highlights">
            <div class="highlight">
                <i class="fas fa-plane"></i>
                <span>Flight: ${tripData.flight?.airline || 'TBD'}</span>
            </div>
            <div class="highlight">
                <i class="fas fa-bed"></i>
                <span>Hotel: ${tripData.hotel?.name || 'TBD'}</span>
            </div>
            <div class="highlight">
                <i class="fas fa-dollar-sign"></i>
                <span>Budget: $${tripData.pricing?.total || 0}</span>
            </div>
        </div>
    `;
}

/**
 * Display day-by-day itinerary
 */
function displayItinerary(itinerary) {
    const container = document.getElementById('itineraryContainer');
    
    if (!itinerary || itinerary.length === 0) {
        container.innerHTML = '<p>No itinerary available</p>';
        return;
    }
    
    container.innerHTML = itinerary.map((day, index) => `
        <div class="day-card">
            <div class="day-header">
                <h4>Day ${index + 1}</h4>
                <div class="day-weather">
                    <i class="fas fa-sun"></i>
                    <span>22°C, Sunny</span>
                </div>
            </div>
            <div class="day-content">
                ${day}
            </div>
        </div>
    `).join('');
}

/**
 * Display AI recommendations
 */
function displayRecommendations(recommendations) {
    const grid = document.getElementById('recommendationsGrid');
    
    if (!recommendations || recommendations.length === 0) {
        grid.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    grid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <div class="rec-icon">
                <i class="fas fa-${getRecommendationIcon(rec.type)}"></i>
            </div>
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            <div class="rec-meta">
                <span class="rec-rating">
                    <i class="fas fa-star"></i>
                    ${rec.rating}
                </span>
                <span class="rec-price">$${rec.price}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Get recommendation icon
 */
function getRecommendationIcon(type) {
    const icons = {
        'restaurant': 'utensils',
        'activity': 'map-marked-alt',
        'hotel': 'bed',
        'transport': 'car',
        'culture': 'landmark',
        'shopping': 'shopping-bag'
    };
    return icons[type] || 'star';
}

/**
 * Display pricing breakdown
 */
function displayPricing(pricing) {
    const breakdown = document.getElementById('pricingBreakdown');
    
    if (!pricing) {
        breakdown.innerHTML = '<p>Pricing information not available</p>';
        return;
    }
    
    breakdown.innerHTML = `
        <div class="pricing-item">
            <span>Flights</span>
            <span>$${pricing.flights || 0}</span>
        </div>
        <div class="pricing-item">
            <span>Accommodation</span>
            <span>$${pricing.accommodation || 0}</span>
        </div>
        <div class="pricing-item">
            <span>Activities</span>
            <span>$${pricing.activities || 0}</span>
        </div>
        <div class="pricing-item">
            <span>Transportation</span>
            <span>$${pricing.transportation || 0}</span>
        </div>
        <div class="pricing-item total">
            <span>Total</span>
            <span>$${pricing.total || 0}</span>
        </div>
    `;
}

/**
 * Initialize analytics dashboard
 */
function initializeAnalytics() {
    const analyticsLink = document.querySelector('.nav-link[href="#analytics"]');
    if (analyticsLink) {
        analyticsLink.addEventListener('click', () => {
            loadAnalyticsDashboard();
        });
    }
    
    // Initialize time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', (e) => {
            loadAnalyticsDashboard(e.target.value);
        });
    }
    
    // Initialize export button
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalyticsReport);
    }
}

/**
 * Load analytics dashboard
 */
async function loadAnalyticsDashboard(timeRange = 'month') {
    try {
        // Show analytics section
        hideAllSections();
        document.getElementById('analytics').classList.remove('hidden');
        
        // Load dashboard data
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/analytics/dashboard?time_range=${timeRange}`);
        if (response.ok) {
            const data = await response.json();
            STATE.analyticsData = data;
            
            // Display metrics
            displayMetrics(data.metrics);
            
            // Display charts
            displayCharts(data.charts);
            
            // Load real-time metrics
            loadRealTimeMetrics();
        }
    } catch (error) {
        console.error('Failed to load analytics:', error);
        showError('Failed to load analytics dashboard');
    }
}

/**
 * Display analytics metrics
 */
function displayMetrics(metrics) {
    const grid = document.getElementById('metricsGrid');
    
    if (!metrics) return;
    
    let metricsHTML = '';
    
    Object.entries(metrics).forEach(([category, categoryMetrics]) => {
        categoryMetrics.forEach(metric => {
            metricsHTML += `
                <div class="metric-card">
                    <div class="metric-value">${metric.value}${metric.unit !== 'users' ? metric.unit : ''}</div>
                    <div class="metric-label">${metric.name}</div>
                    ${metric.change_percentage ? `
                        <div class="metric-change ${metric.trend === 'up' ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${metric.trend === 'up' ? 'up' : 'down'}"></i>
                            ${Math.abs(metric.change_percentage)}%
                        </div>
                    ` : ''}
                </div>
            `;
        });
    });
    
    grid.innerHTML = metricsHTML;
}

/**
 * Display analytics charts
 */
function displayCharts(charts) {
    if (!charts) return;
    
    // User Growth Chart
    if (charts.user_growth) {
        const userGrowthData = JSON.parse(charts.user_growth);
        Plotly.newPlot('userGrowthChart', userGrowthData.data, userGrowthData.layout);
    }
    
    // Revenue Chart
    if (charts.revenue) {
        const revenueData = JSON.parse(charts.revenue);
        Plotly.newPlot('revenueChart', revenueData.data, revenueData.layout);
    }
    
    // Trip Planning Chart
    if (charts.trip_planning) {
        const tripPlanningData = JSON.parse(charts.trip_planning);
        Plotly.newPlot('tripPlanningChart', tripPlanningData.data, tripPlanningData.layout);
    }
    
    // Engagement Chart
    if (charts.engagement) {
        const engagementData = JSON.parse(charts.engagement);
        Plotly.newPlot('engagementChart', engagementData.data, engagementData.layout);
    }
}

/**
 * Load real-time metrics
 */
async function loadRealTimeMetrics() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/analytics/real-time`);
        if (response.ok) {
            const data = await response.json();
            displayRealTimeMetrics(data);
        }
    } catch (error) {
        console.error('Failed to load real-time metrics:', error);
    }
    
    // Update every 5 seconds
    setTimeout(loadRealTimeMetrics, CONFIG.ANALYTICS_UPDATE_INTERVAL);
}

/**
 * Display real-time metrics
 */
function displayRealTimeMetrics(data) {
    const grid = document.getElementById('realTimeGrid');
    
    if (!data) return;
    
    grid.innerHTML = `
        <div class="real-time-metric">
            <div class="metric-icon">
                <i class="fas fa-users"></i>
            </div>
            <div class="metric-info">
                <div class="metric-value">${data.current_sessions}</div>
                <div class="metric-label">Active Sessions</div>
            </div>
        </div>
        <div class="real-time-metric">
            <div class="metric-icon">
                <i class="fas fa-user-friends"></i>
            </div>
            <div class="metric-info">
                <div class="metric-value">${data.active_users}</div>
                <div class="metric-label">Active Users</div>
            </div>
        </div>
        <div class="real-time-metric">
            <div class="metric-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-info">
                <div class="metric-value">${data.api_requests_per_minute}</div>
                <div class="metric-label">API Requests/min</div>
            </div>
        </div>
        <div class="real-time-metric">
            <div class="metric-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="metric-info">
                <div class="metric-value">${data.error_count}</div>
                <div class="metric-label">Errors</div>
            </div>
        </div>
    `;
}

/**
 * Export analytics report
 */
async function exportAnalyticsReport() {
    if (!STATE.analyticsData) {
        showError('No analytics data to export');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/analytics/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                report_data: STATE.analyticsData,
                format: 'csv'
            })
        });
        
        if (response.ok) {
            const csvData = await response.text();
            downloadCSV(csvData, 'analytics_report.csv');
        }
    } catch (error) {
        console.error('Failed to export report:', error);
        showError('Failed to export analytics report');
    }
}

/**
 * Download CSV file
 */
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Initialize payment system
 */
function initializePaymentSystem() {
    // Initialize Stripe
    if (typeof Stripe !== 'undefined') {
        window.stripe = Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
    }
    
    // Initialize payment buttons
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', showPaymentModal);
    }
    
    // Initialize payment modal
    initializePaymentModal();
}

/**
 * Initialize payment modal
 */
function initializePaymentModal() {
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.getElementById('closePaymentModal');
    const cancelBtn = document.getElementById('cancelPaymentBtn');
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePaymentModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hidePaymentModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', processPayment);
    }
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hidePaymentModal();
        }
    });
}

/**
 * Show payment modal
 */
function showPaymentModal() {
    if (!STATE.currentTrip) {
        showError('No trip selected for booking');
        return;
    }
    
    // Populate payment items
    populatePaymentItems();
    
    // Show modal
    document.getElementById('paymentModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide payment modal
 */
function hidePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Populate payment items
 */
function populatePaymentItems() {
    const itemsContainer = document.getElementById('paymentItems');
    const totalElement = document.getElementById('paymentTotal');
    
    if (!STATE.currentTrip || !STATE.currentTrip.pricing) return;
    
    const pricing = STATE.currentTrip.pricing;
    let total = 0;
    
    const itemsHTML = `
        <div class="payment-item">
            <span>Flight to ${STATE.currentTrip.destination}</span>
            <span>$${pricing.flights || 0}</span>
        </div>
        <div class="payment-item">
            <span>${STATE.currentTrip.duration} nights accommodation</span>
            <span>$${pricing.accommodation || 0}</span>
        </div>
        <div class="payment-item">
            <span>Activities & experiences</span>
            <span>$${pricing.activities || 0}</span>
        </div>
        <div class="payment-item">
            <span>Local transportation</span>
            <span>$${pricing.transportation || 0}</span>
        </div>
    `;
    
    itemsContainer.innerHTML = itemsHTML;
    totalElement.textContent = `$${pricing.total || 0}`;
}

/**
 * Process payment
 */
async function processPayment() {
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        if (paymentMethod === 'stripe') {
            await processStripePayment();
        } else if (paymentMethod === 'paypal') {
            await processPayPalPayment();
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showError('Payment failed. Please try again.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Securely';
    }
}

/**
 * Process Stripe payment
 */
async function processStripePayment() {
    if (!window.stripe) {
        throw new Error('Stripe not initialized');
    }
    
    // Create payment intent
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/payment/create-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: STATE.currentTrip.pricing.total * 100, // Convert to cents
            currency: 'usd',
            trip_id: STATE.currentTrip.id
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create payment intent');
    }
    
    const { client_secret } = await response.json();
    
    // Confirm payment
    const result = await window.stripe.confirmCardPayment(client_secret, {
        payment_method: {
            card: {
                // In a real app, you'd collect card details here
                number: '4242424242424242',
                exp_month: 12,
                exp_year: 2025,
                cvc: '123'
            }
        }
    });
    
    if (result.error) {
        throw new Error(result.error.message);
    }
    
    // Payment successful
    showSuccess('Payment successful! Your trip has been booked.');
    hidePaymentModal();
}

/**
 * Process PayPal payment
 */
async function processPayPalPayment() {
    // In a real app, this would redirect to PayPal
    showError('PayPal integration not implemented in demo');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Watch demo button
    const watchDemoBtn = document.getElementById('watchDemoBtn');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', () => {
            alert('Demo video would play here');
        });
    }
    
    // Export buttons
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }
    
    const exportCalendarBtn = document.getElementById('exportCalendarBtn');
    if (exportCalendarBtn) {
        exportCalendarBtn.addEventListener('click', exportToCalendar);
    }
    
    const shareItineraryBtn = document.getElementById('shareItineraryBtn');
    if (shareItineraryBtn) {
        shareItineraryBtn.addEventListener('click', shareItinerary);
    }
    
    // Save preferences
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveUserPreferences);
    }
}

/**
 * Export to PDF
 */
function exportToPDF() {
    // In a real app, this would generate and download a PDF
    alert('PDF export would generate here');
}

/**
 * Export to Calendar
 */
function exportToCalendar() {
    if (!STATE.currentTrip) return;
    
    const trip = STATE.currentTrip;
    const startDate = new Date(trip.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + trip.duration);
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:Trip to ${trip.destination}`,
        `DESCRIPTION:${trip.duration} day trip to ${trip.destination}`,
        `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip_${trip.destination.toLowerCase()}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Share itinerary
 */
function shareItinerary() {
    if (navigator.share) {
        navigator.share({
            title: `Trip to ${STATE.currentTrip?.destination}`,
            text: `Check out my ${STATE.currentTrip?.duration} day trip to ${STATE.currentTrip?.destination}!`,
            url: window.location.href
        });
    } else {
        // Fallback to copying to clipboard
        const shareText = `Trip to ${STATE.currentTrip?.destination}: ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showSuccess('Itinerary link copied to clipboard!');
        });
    }
}

/**
 * Save user preferences
 */
async function saveUserPreferences() {
    const form = document.getElementById('advancedTravelForm');
    const formData = new FormData(form);
    
    const preferences = {
        travelStyle: formData.get('travelStyle'),
        preferences: Array.from(formData.getAll('preferences')),
        accommodationType: formData.get('accommodationType'),
        transportation: formData.get('transportation'),
        accessibility: formData.get('accessibility'),
        language: formData.get('language')
    };
    
    try {
        // In a real app, this would save to backend
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        showSuccess('Preferences saved successfully!');
    } catch (error) {
        console.error('Failed to save preferences:', error);
        showError('Failed to save preferences');
    }
}

/**
 * Set default date to tomorrow
 */
function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.value = tomorrow.toISOString().split('T')[0];
    }
}

/**
 * Check API health
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/health`);
        if (response.ok) {
            console.log('✅ API is healthy');
        } else {
            console.warn('⚠️ API health check failed');
        }
    } catch (error) {
        console.error('❌ API health check failed:', error);
    }
}

/**
 * Hide all sections
 */
function hideAllSections() {
    const sections = ['loading', 'results', 'analytics'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('hidden');
        }
    });
}

/**
 * Show error message
 */
function showError(message) {
    // In a real app, this would show a proper error notification
    alert(`Error: ${message}`);
}

/**
 * Show success message
 */
function showSuccess(message) {
    // In a real app, this would show a proper success notification
    alert(`Success: ${message}`);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.AITravelAgent = {
    sendChatMessage,
    planTrip,
    loadAnalyticsDashboard,
    showPaymentModal,
    exportToPDF,
    exportToCalendar,
    shareItinerary
};

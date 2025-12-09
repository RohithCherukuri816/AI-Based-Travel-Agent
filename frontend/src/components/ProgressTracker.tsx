import React from 'react';

interface ProgressTrackerProps {
    planningProgress: {
        destination: boolean;
        preferences: boolean;
        itinerary: boolean;
        budget: boolean;
        booking: boolean;
    };
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ planningProgress }) => {
    type StepKey = keyof ProgressTrackerProps['planningProgress'];

    const steps: { key: StepKey; label: string; icon: string; description: string }[] = [
        { key: 'destination', label: 'Destination', icon: 'fa-map-marker-alt', description: 'Select where to go' },
        { key: 'preferences', label: 'Preferences', icon: 'fa-sliders-h', description: 'Travel style & interests' },
        { key: 'itinerary', label: 'Itinerary', icon: 'fa-calendar-alt', description: 'Day-by-day plan' },
        { key: 'budget', label: 'Budget', icon: 'fa-wallet', description: 'Cost analysis' },
        { key: 'booking', label: 'Booking', icon: 'fa-check-circle', description: 'Finalize details' }
    ];

    const getStepStatus = (stepKey: StepKey, index: number) => {
        if (planningProgress[stepKey]) return 'completed';
        // Check if previous step is completed to mark as active
        const prevKey = index > 0 ? steps[index - 1].key : null;
        if (prevKey && planningProgress[prevKey] && !planningProgress[stepKey]) return 'active';
        if (index === 0 && !planningProgress[stepKey]) return 'active';
        return '';
    };

    return (
        <div className="widget">
            <div className="widget-title">
                <i className="fas fa-tasks"></i> Planning Progress
            </div>
            <div className="progress-steps">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.key, index);
                    return (
                        <div key={step.key} className={`progress-step ${status}`}>
                            <div className={`step-icon ${status}`}>
                                {status === 'completed' ? <i className="fas fa-check"></i> : <i className={`fas ${step.icon}`}></i>}
                            </div>
                            <div className="step-info">
                                <div className="step-label">{step.label}</div>
                                <div className="step-description">{step.description}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressTracker;

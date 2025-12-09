import React from 'react';

interface QuickActionsProps {
    onAction: (message: string) => void;
    hasLocation: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, hasLocation }) => {
    return (
        <div className="widget">
            <h3 className="widget-title">
                <i className="fas fa-bolt"></i>
                Quick Actions
            </h3>
            <div className="quick-actions">
                <button className="action-btn" onClick={() => onAction("Show me budget options")}>
                    <i className="fas fa-dollar-sign"></i>
                    Budget Options
                </button>
                <button className="action-btn" onClick={() => onAction("What are the best activities?")}>
                    <i className="fas fa-star"></i>
                    Top Activities
                </button>
                <button className="action-btn" onClick={() => onAction("Show accommodation options")}>
                    <i className="fas fa-hotel"></i>
                    Accommodation
                </button>
                <button className="action-btn" onClick={() => onAction("What's the weather like?")}>
                    <i className="fas fa-cloud-sun"></i>
                    Weather Info
                </button>
                {hasLocation && (
                    <button className="action-btn" onClick={() => onAction("What's nearby me?")}>
                        <i className="fas fa-map-marker-alt"></i>
                        Nearby Places
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuickActions;

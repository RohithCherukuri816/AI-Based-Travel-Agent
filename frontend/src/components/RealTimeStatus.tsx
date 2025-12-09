import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

import './RealTimeStatus.css';

interface RealTimeStatusProps {
    showByDefault?: boolean;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ showByDefault = false }) => {
    const [isVisible, setIsVisible] = useState(showByDefault);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible) {
            fetchStatus();
        }
    }, [isVisible]);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const response = await apiService.getRealTimeStatus();
            if (response.success) {
                setStatus(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch real-time status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) {
        return (
            <>

                <button
                    className="realtime-status"
                    onClick={() => setIsVisible(true)}
                    style={{ padding: '10px', cursor: 'pointer' }}
                >
                    📡 Real-Time APIs
                </button>
            </>
        );
    }

    return (
        <>

            <div className="realtime-status">
                <button
                    className="status-toggle"
                    onClick={() => setIsVisible(false)}
                >
                    ×
                </button>

                <div className="status-header">📡 Real-Time API Status</div>

                {loading ? (
                    <div>Loading...</div>
                ) : status ? (
                    <>
                        <div className="api-status">
                            <span>Google Places:</span>
                            <span className={status.apis?.google_places?.available ? 'status-active' : 'status-inactive'}>
                                {status.apis?.google_places?.available ? '✅ Active' : '❌ Inactive'}
                            </span>
                        </div>

                        <div className="api-status">
                            <span>OpenWeather:</span>
                            <span className={status.apis?.openweather?.available ? 'status-active' : 'status-inactive'}>
                                {status.apis?.openweather?.available ? '✅ Active' : '❌ Inactive'}
                            </span>
                        </div>

                        <div className="api-status">
                            <span>Gemini AI:</span>
                            <span className={status.apis?.gemini_ai?.available ? 'status-active' : 'status-inactive'}>
                                {status.apis?.gemini_ai?.available ? '✅ Active' : '❌ Inactive'}
                            </span>
                        </div>

                        <div className="feature-list">
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Features:</div>

                            <div className="feature-item">
                                <span>Real Activities:</span>
                                <span className={status.features?.real_time_activities ? 'status-active' : 'status-inactive'}>
                                    {status.features?.real_time_activities ? '✅' : '❌'}
                                </span>
                            </div>

                            <div className="feature-item">
                                <span>Real Weather:</span>
                                <span className={status.features?.real_time_weather ? 'status-active' : 'status-inactive'}>
                                    {status.features?.real_time_weather ? '✅' : '❌'}
                                </span>
                            </div>

                            <div className="feature-item">
                                <span>AI Flights:</span>
                                <span className={status.features?.ai_powered_flights ? 'status-active' : 'status-inactive'}>
                                    {status.features?.ai_powered_flights ? '✅' : '❌'}
                                </span>
                            </div>

                            <div className="feature-item">
                                <span>AI Hotels:</span>
                                <span className={status.features?.ai_powered_hotels ? 'status-active' : 'status-inactive'}>
                                    {status.features?.ai_powered_hotels ? '✅' : '❌'}
                                </span>
                            </div>

                            <div className="feature-item">
                                <span>Smart Chat:</span>
                                <span className={status.features?.smart_chat ? 'status-active' : 'status-inactive'}>
                                    {status.features?.smart_chat ? '✅' : '❌'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={fetchStatus}
                            style={{
                                marginTop: '10px',
                                padding: '5px 10px',
                                background: '#4facfe',
                                border: 'none',
                                borderRadius: '5px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🔄 Refresh
                        </button>
                    </>
                ) : (
                    <div>Failed to load status</div>
                )}
            </div>
        </>
    );
};

export default RealTimeStatus;
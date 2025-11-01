import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const statusStyles = `
  .realtime-status {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 10px;
    font-size: 12px;
    z-index: 1000;
    min-width: 250px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-header {
    font-weight: bold;
    margin-bottom: 10px;
    color: #4facfe;
  }

  .api-status {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    padding: 3px 0;
  }

  .status-active {
    color: #10b981;
  }

  .status-inactive {
    color: #ef4444;
  }

  .status-toggle {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
  }

  .feature-list {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .feature-item {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    font-size: 11px;
  }
`;

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
                <style>{statusStyles}</style>
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
            <style>{statusStyles}</style>
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
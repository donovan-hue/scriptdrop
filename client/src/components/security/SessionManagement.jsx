import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Security.css';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/twofactor/sessions');
      setSessions(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const logoutSession = async (sessionId) => {
    try {
      await axios.post(`/api/twofactor/sessions/${sessionId}/logout`);
      fetchSessions();
    } catch (error) {
      alert('Error logging out session');
    }
  };

  const logoutAllDevices = async () => {
    if (confirm('Log out from ALL devices?')) {
      try {
        await axios.post('/api/twofactor/sessions/logout-all');
        alert('Logged out from all devices');
        fetchSessions();
      } catch (error) {
        alert('Error logging out');
      }
    }
  };

  if (loading) return <div className="security-container">Loading...</div>;

  return (
    <div className="security-container">
      <h2>📱 Active Sessions</h2>

      <button onClick={logoutAllDevices} className="danger-btn logout-all">
        Logout All Devices
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div key={session._id} className="session-item">
            <div className="session-info">
              <div className="device-name">{session.deviceInfo?.browser} on {session.deviceInfo?.os}</div>
              <div className="session-meta">
                <span>📍 {session.location?.city}, {session.location?.country}</span>
                <span>🔗 {session.ipAddress}</span>
              </div>
              <div className="session-time">
                Last active: {new Date(session.lastActivityAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => logoutSession(session._id)}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionManagement;

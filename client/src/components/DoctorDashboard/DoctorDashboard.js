import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const { user, logout } = useAuth0();
  const [alerts, setAlerts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Pass the email in headers to satisfy our basic backend MVP verification
      const config = { headers: { 'x-user-email': user.email || user.name } };

      const [alertsRes, patientsRes] = await Promise.all([
        axios.get('/api/doctor/alerts', config),
        axios.get('/api/doctor/patients', config)
      ]);

      setAlerts(alertsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error("Error fetching doctor data", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const config = { headers: { 'x-user-email': user.email || user.name } };
      await axios.post(`/api/doctor/alerts/${id}/read`, {}, config);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  if (loading) return <div className="doc-loading">Loading Medical Dashboard...</div>;

  return (
    <div className="doc-dashboard">
      <header className="doc-header">
        <div className="doc-header-content">
          <h1>Banner Health Professional Portal</h1>
          <div className="doc-user-info">
            <span>Dr. {user.given_name || user.name}</span>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="doc-logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="doc-main">
        {/* Alerts Section */}
        <section className="doc-section doc-alerts-section">
          <h2>⚠️ Active AI Alerts</h2>
          {alerts.length === 0 ? (
            <div className="doc-empty-state">No active alerts. All patients stable.</div>
          ) : (
            <div className="doc-alerts-grid">
              {alerts.map(alert => (
                <div key={alert.id} className="doc-alert-card">
                  <div className="doc-alert-header">
                    <h3>{alert.name}</h3>
                    <span className="doc-alert-time">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="doc-alert-reason">{alert.alert_reason}</p>
                  <button onClick={() => markAsRead(alert.id)} className="doc-btn doc-btn-outline">
                    Dismiss Alert
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Patients Section */}
        <section className="doc-section doc-patients-section">
          <h2>Patient Directory</h2>
          {patients.length === 0 ? (
            <div className="doc-empty-state">No patients found.</div>
          ) : (
            <div className="doc-table-container">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age/DOB</th>
                    <th>Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.email}</td>
                      <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {p.diseases && p.diseases.length > 0
                          ? p.diseases.map(d => <span key={d} className="doc-pill">{d}</span>)
                          : 'None reported'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;

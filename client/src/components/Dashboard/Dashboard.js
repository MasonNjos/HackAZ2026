import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import BannerResources from '../BannerResources';

const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('healthCreditsUser');
    if (stored) {
      setLocalUser(JSON.parse(stored));
    }
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>Loading...</div>;

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-inner">
          <div>
            <h1>Saguaro Link</h1>
          </div>

          {!isAuthenticated && !localUser ? (
            <div className="auth-actions">
              <button
                className="btn-primary"
                onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="user-actions">
              <p className="welcome-text">Welcome, {user?.given_name || user?.name || localUser?.email}!</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  localStorage.removeItem('healthCreditsUser');
                  setLocalUser(null);
                  if (isAuthenticated) {
                    logout({ logoutParams: { returnTo: window.location.origin } });
                  } else {
                    window.location.reload();
                  }
                }}
              >
                 Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Unauthenticated Hero ── */}
      {!isAuthenticated && !localUser && (
        <div className="hero-section">
          <h2>Manage your health. Stay connected.</h2>
          <p>Log your vitals, track symptoms, and stay in touch with your care team — all in one place.</p>
        </div>
      )}

      {/* ── Authenticated Main Content ── */}
      {(isAuthenticated || localUser) && (
        <main className="dashboard-main">

          {/* Cards Area */}
          <section className="sections">

            {/* CARD 1: DAILY CHECK-IN */}
            <div className="section-card">
              <div className="card-icon card-icon--blue">📊</div>
              <h3>Health Check-In</h3>
              <p>Record your vitals, symptoms, and daily activity.</p>
              <Link to="/checkin" className="btn-primary">Log Today</Link>
            </div>

            {/* CARD 2: DOCTOR CHAT */}
            <div className="section-card">
              <div className="card-icon card-icon--green">💬</div>
              <h3>Doctor Chat</h3>
              <p>Directly message your care team with questions or concerns.</p>
              <Link to="/chat" className="btn-primary">Open Chat</Link>
            </div>

            {/* CARD 3: LOG HISTORY */}
            <div className="section-card">
              <div className="card-icon card-icon--purple">📋</div>
              <h3>My Logs</h3>
              <p>Review your check-in history and track your health progress.</p>
              <Link to="/history" className="btn-primary">View History</Link>
            </div>

            {/* CARD 4: REQUEST A RIDE */}
            <div className="section-card">
              <div className="card-icon card-icon--yellow">🚗</div>
              <h3>Request a Ride</h3>
              <p>Schedule or request transportation to your upcoming appointments.</p>
              <Link to="/ride" className="btn-primary">Get a Ride</Link>
            </div>

          </section>

          {/* Daily Tip */}
          <div className="tip-box">
            <span className="tip-icon">ℹ️</span>
            <div>
              <strong>Proactive Care</strong>
              <p>Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively.</p>
            </div>
          </div>

          <BannerResources title="Banner Health Resources" />

        </main>
      )}
    </div>
  );
};

export default Dashboard;

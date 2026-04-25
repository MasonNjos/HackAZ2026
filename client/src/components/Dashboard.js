import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    // Check for local session if Auth0 isn't the only provider
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
              <p className="welcome-text">Welcome, {user?.name || localUser?.email}!</p>
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

      {/* ── Unauthenticated Hero (Broadened Scope) ── */}
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

            <div className="section-card">
              <div className="card-icon card-icon--blue">📊</div>
              <h3>Health Check-In</h3>
              <p>Record your vitals, symptoms, and daily activity.</p>
              <Link to="/checkin" className="btn-primary">Daily Check-In</Link>
            </div>

            {/* Note: You can add other cards here later, like 'History' or 'Care Team' */}

          </section>

          {/* Daily Tip */}
          <div className="tip-box">
            <span className="tip-icon">ℹ️</span>
            <div>
              <strong>Proactive Care</strong>
              <p>Logging your vitals daily helps Saguaro Link identify patterns and helps you manage your health more effectively.</p>
            </div>
          </div>

        </main>
      )}
    </div>
  );
};

export default Dashboard;
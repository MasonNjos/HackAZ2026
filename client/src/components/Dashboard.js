import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [progress, setProgress] = useState(0);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    setProgress(60);
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

     {/* ── Unauthenticated hero ── */}
{!isAuthenticated && !localUser && (
  <div className="hero-section">
    <h2>Manage your diabetes. Earn health credits.</h2>
    <p>Log your glucose, complete daily check-ins, and access educational modules — all in one place.</p>
  </div>
)}
      {/* ── Authenticated main content ── */}
      {(isAuthenticated || localUser) && (
        <main className="dashboard-main">

          {/* Progress */}
          <section className="progress-section">
            <h2>Health Credits Progress</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>{progress}% towards next reward</p>
          </section>

          {/* Cards */}
          <section className="sections">

            <div className="section-card">
              <div className="card-icon card-icon--blue">📊</div>
              <h3>My Glucose Log</h3>
              <p>Track your daily blood sugar levels</p>
              <Link to="/checkin" className="btn-primary">Log Today</Link>
            </div>

            <div className="section-card">
              <div className="card-icon card-icon--green">📚</div>
              <h3>Health Learning</h3>
              <p>Access educational modules</p>
              <button className="btn-primary btn-disabled" disabled>Coming Soon</button>
            </div>

          </section>

          {/* Daily tip */}
          <div className="tip-box">
            <span className="tip-icon">ℹ️</span>
            <div>
              <strong>Daily Tip</strong>
              <p>Log your glucose at least 3 times a day to track patterns and maintain better health.</p>
            </div>
          </div>

        </main>
      )}
    </div>
  );
};

export default Dashboard;





// TODO: Need to add at the bottom services it provides. 
// 1.Need to get rid of the  grey box at the bottom with that black line
// 2. Add different boxes with things that it provides
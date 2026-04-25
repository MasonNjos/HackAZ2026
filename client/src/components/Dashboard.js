import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Mock progress
    setProgress(60);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Health Credits Platform</h1>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={() => loginWithRedirect({
            appState: {
              returnTo: window.location.pathname
            }
          })}>
            Log In
          </button>
        ) : (
          <div>
            <p>Welcome, {user.name}!</p>
            <button className="btn-secondary" onClick={() => logout({
              logoutParams: {
                returnTo: window.location.origin
              }
            })}>
              Log Out
            </button>
          </div>
        )}
      </header>

      {isAuthenticated && (
        <main className="dashboard-main">
          <section className="progress-section">
            <h2>Health Credits Progress</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{progress}% towards next reward</p>
          </section>

          <section className="sections">
            <div className="section-card">
              <h3>My Glucose Log</h3>
              <p>Track your daily blood sugar levels</p>
              <Link to="/checkin" className="btn-primary">Log Today</Link>
            </div>
            <div className="section-card">
              <h3>Health Learning</h3>
              <p>Access educational modules</p>
              <button className="btn-primary" disabled>Coming Soon</button>
            </div>
            <div className="section-card">
              <h3>My Wallet</h3>
              <p>View and redeem your Solana credits</p>
              <Link to="/credits" className="btn-primary">View Credits</Link>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Dashboard;
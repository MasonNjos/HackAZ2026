import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import BannerResources from '../BannerResources';
import axios from 'axios';

const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [rewardsData, setRewardsData] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem('healthCreditsUser');
    if (stored) {
      setLocalUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated || localUser) {
      axios.get('/api/rides')
        .then(res => setRides(res.data))
        .catch(err => console.error('Error fetching rides:', err));
        
      axios.get('/api/credits/balance')
        .then(res => setRewardsData(res.data))
        .catch(err => console.error('Error fetching rewards:', err));
    }
  }, [isAuthenticated, localUser]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>Loading...</div>;

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-inner">
          <div>
            <h1>{t("Saguaro Link")}</h1>
          </div>

          {!isAuthenticated && !localUser ? (
            <div className="auth-actions">
              <LanguageToggle />
              <button
                className="btn-primary"
                onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
              >
                {t("Get Started")}
              </button>
            </div>
          ) : (
              <div className="user-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ff7b00' }}>🔥 {rewardsData?.streak || 0} {rewardsData?.streak === 1 ? t("Day") : t("Days")}</span>
                  <span style={{ fontWeight: 'bold', color: '#fbbc05' }}>⭐ {rewardsData?.balance || 0}</span>
                </div>
              <LanguageToggle />
              <p className="welcome-text">{t("Welcome")}, {user?.given_name || user?.name || localUser?.email}!</p>
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
                 {t("Log Out")}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Unauthenticated Hero ── */}
      {!isAuthenticated && !localUser && (
        <div className="hero-section">
          <h2>{t("Manage your health. Stay connected.")}</h2>
          <p>{t("Log your vitals, track symptoms, and stay in touch with your care team — all in one place.")}</p>
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
              <h3>{t("Health Check-In")}</h3>
              <p>{t("Record your vitals, symptoms, and daily activity.")}</p>
              <Link to="/checkin-options" className="btn-primary">{t("Log Today")}</Link>
            </div>

            {/* CARD 2: DOCTOR CHAT */}
            <div className="section-card">
              <div className="card-icon card-icon--green">💬</div>
              <h3>{t("Doctor Chat")}</h3>
              <p>{t("Directly message your care team with questions or concerns.")}</p>
              <Link to="/chat" className="btn-primary">{t("Open Chat")}</Link>
            </div>

            {/* CARD 3: LOG HISTORY */}
            <div className="section-card">
              <div className="card-icon card-icon--purple">📋</div>
              <h3>{t("My Logs")}</h3>
              <p>{t("Review your check-in history and track your health progress.")}</p>
              <Link to="/history" className="btn-primary">{t("View History")}</Link>
            </div>

            {/* CARD 4: REQUEST A RIDE */}
            <div className="section-card">
              <div className="card-icon card-icon--yellow">🚗</div>
              <h3>{t("Request a Ride")}</h3>
              <p>{t("Schedule or request transportation to your upcoming appointments.")}</p>
              <Link to="/ride" className="btn-primary">{t("Get a Ride")}</Link>
            </div>

            {/* CARD 5: INCENTIVES / REWARDS */}
            <div className="section-card">
              <div className="card-icon card-icon--orange">🎁</div>
              <h3>{t("Rewards & Streak")}</h3>
              <p>{t("Check your daily streak, earn points, and redeem them for rewards.")}</p>
              <Link to="/rewards" className="btn-primary">{t("View Rewards")}</Link>
            </div>

          </section>

          {/* Scheduled Rides */}
          {rides.length > 0 && (
            <section className="upcoming-rides" style={{ marginBottom: '1.5rem', background: '#fff', border: '2px solid #000', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1.5px solid #e0e0e0', paddingBottom: '0.5rem' }}>
                🚗 {t("Upcoming Rides")}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rides.map(ride => (
                  <div key={ride.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#FFF9E6', borderLeft: '4px solid #e6a817' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#333' }}>{t("To")}: {ride.destination}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>{t("From")}: {ride.pickup}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', color: '#7a4f00' }}>
                        {new Date(ride.date).toLocaleDateString()}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>
                        {ride.time.slice(0,5)} {ride.wheelchair ? '♿' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Daily Tip */}
          <div className="tip-box">
            <span className="tip-icon">ℹ️</span>
            <div>
              <strong>{t("Proactive Care")}</strong>
              <p>{t("Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively.")}</p>
            </div>
          </div>

          <BannerResources title={t("Banner Health Resources")} />

        </main>
      )}
    </div>
  );
};

export default Dashboard;

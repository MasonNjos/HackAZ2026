import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import BannerResources from '../BannerResources';

const Dashboard = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);
  const { t } = useLanguage();

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
              <Link to="/checkin" className="btn-primary">{t("Log Today")}</Link>
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

          </section>

          {/* Daily Tip */}
          <div className="tip-box">
            <span className="tip-icon">ℹ️</span>
            <div>
              <strong>{t("Proactive Care")}</strong>
              <p>{t("Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively.")}</p>
            </div>
          </div>

          <BannerResources title="Banner Health Resources" />

        </main>
      )}
    </div>
  );
};

export default Dashboard;

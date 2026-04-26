import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';

const CheckinOptions = () => {
  const { user } = useAuth0();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-inner">
          <div>
            <h1>{t("Saguaro Link")}</h1>
            <p>{t("Choose how you want to check in today")}</p>
          </div>
          <div className="user-actions">
            <LanguageToggle />
            <button className="btn-secondary" onClick={() => navigate('/')}>
               {t("Back to Home")}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="sections" style={{ marginTop: '2rem' }}>
          {/* Option 1: Text */}
          <div className="section-card">
            <div className="card-icon card-icon--blue">⌨️</div>
            <h3>{t("Text Input")}</h3>
            <p>{t("Type your answers using the standard form.")}</p>
            <Link to="/checkin?mode=text" className="btn-primary">{t("Select Text")}</Link>
          </div>

          {/* Option 2: Speech */}
          <div className="section-card">
            <div className="card-icon card-icon--green">🎙️</div>
            <h3>{t("Speech Input")}</h3>
            <p>{t("Talk to the app to log your check-in automatically.")}</p>
            <Link to="/checkin?mode=speech" className="btn-primary">{t("Select Speech")}</Link>
          </div>

          {/* Option 3: Images */}
          <div className="section-card">
            <div className="card-icon card-icon--purple">🖼️</div>
            <h3>{t("Picture Mode")}</h3>
            <p>{t("Use simple images and emojis to answer the questions.")}</p>
            <Link to="/checkin?mode=images" className="btn-primary">{t("Select Images")}</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CheckinOptions;

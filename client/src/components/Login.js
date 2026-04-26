'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import BannerResources from './BannerResources';
import LanguageToggle from './LanguageToggle/LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const { loginWithRedirect } = useAuth0();
  const { t } = useLanguage();

  // Helper to trigger the Auth0 Signup screen specifically
  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-inner">
          <div>
            <h1>{t("Saguaro Link")}</h1>
           
          </div>
          <div className="auth-actions">
            <LanguageToggle />
            {/* Standard Login */}
            <button className="btn-secondary" onClick={() => loginWithRedirect()}>
              {t("Log In")}
            </button>
            {/* Redirects to OAuth Signup */}
            <button className="btn-primary" onClick={handleSignUp}>
              {t("Sign Up")}
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <h2>{t("Take Control of Your Health")}</h2>
        <p>
         {t("Track your daily health, monitor symptoms, and share insights with your care team—all in one place. Join Saguaro Link today and start your journey towards better health management.")} 
        </p>
        {/* Redirects to OAuth Signup */}
        <button className="btn-primary btn-large" onClick={handleSignUp}>
          {t("Get Started Today")}
        </button>
      </section>

      <div className="dashboard-main dashboard-main--login">
        <BannerResources compact />
      </div>
    </div>
  );
};

export default Login;

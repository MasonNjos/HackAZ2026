'use client';
// 1. Added useEffect to the import
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './signup.css';

const SignUp = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const { t } = useLanguage();
  
  // 2. Define the missing formData state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // 3. Define the missing 'started' state for the redirect logic
  const [started, setStarted] = useState(false);
  
  const [status, setStatus] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(t('Signing up...'));
    setIsError(false);
    try {
      const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
      await axios.post(`https://${auth0Domain}/dbconnections/signup`, {
        client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
        email: formData.email,
        password: formData.password,
        connection: process.env.REACT_APP_AUTH0_CONNECTION,
        user_metadata: { full_name: formData.fullName }
      });
      setStatus(t('Account created! Redirecting to login...'));
      await loginWithRedirect({
        authorizationParams: { login_hint: formData.email }
      });
    } catch (error) {
      console.error(error);
      setIsError(true);
      const errorMessage =
        error.response?.data?.description ||
        error.response?.data?.message ||
        error.message ||
        t('Sign up failed. Please check your details and try again.');
      setStatus(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  useEffect(() => {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    
    if (!domain || !clientId) {
      setStatus(t('Missing Auth0 config. Set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID in client/.env.'));
      return;
    }

    // Logic to trigger Auth0 signup screen if needed
    if (!isLoading && !isAuthenticated && !started) {
      setStarted(true);
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, started, t]);

  return (
    <div className="signup-page">
      <header className="signup-header">
        <h1>{t("Saguaro Link")}</h1>
        <p className="signup-header-subtitle">{t("Your Diabetes Management Portal")}</p>
      </header>

      <main className="signup-main">
        <div className="signup-card">
          <h2 className="signup-title">{t("Create an Account")}</h2>
          <p className="signup-desc">{t("Join Saguaro Link to start tracking your blood glucose and earning health credits.")}</p>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="fullName">{t("Full Name")}</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Maria Garcia"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t("Email Address")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("Password")}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("At least 8 characters")}
                required
                minLength={8}
              />
              <span className="field-hint">{t("Must be at least 8 characters and include a number.")}</span>
            </div>

            <button type="submit" className="btn-primary btn-full">
              {t("Sign Up")}
            </button>
          </form>

          {status && (
            <p className={`signup-status ${isError ? 'signup-status--error' : 'signup-status--success'}`}>
              {status}
            </p>
          )}

          <div className="signup-divider" />

          <p className="signup-login-prompt">
            {t("Already have an account?")}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => loginWithRedirect({ appState: { returnTo: '/' } })}
            >
              {t("Please log in")}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
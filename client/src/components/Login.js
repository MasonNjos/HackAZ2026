'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { loginWithRedirect } = useAuth0();

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
            <h1>Saguaro Link</h1>
           
          </div>
          <div className="auth-actions">
            {/* Standard Login */}
            <button className="btn-secondary" onClick={() => loginWithRedirect()}>
              Log In
            </button>
            {/* Redirects to OAuth Signup */}
            <button className="btn-primary" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <h2>Take Control of Your Health</h2>
        <p>
         Track your daily health, monitor symptoms, and share insights with your care team—all in one place. 
         Join Saguaro Link today and start your journey towards better health management. 
        </p>
        {/* Redirects to OAuth Signup */}
        <button className="btn-primary btn-large" onClick={handleSignUp}>
          Get Started Today
        </button>
      </section>
    </div>
  );
};

export default Login;
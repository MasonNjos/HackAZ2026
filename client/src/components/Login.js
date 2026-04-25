'use client';

import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [status, setStatus] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // If user manually visits /login while already logged in, send them home.
    if (!isLoading && isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    if (!domain || !clientId) {
      setStatus('Missing Auth0 config. Set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID in client/.env.');
      return;
    }

    if (!isLoading && !isAuthenticated && !started) {
      setStarted(true);
      loginWithRedirect({ appState: { returnTo: '/' } }).catch((e) => {
        console.error(e);
        setStarted(false);
        setStatus('Unable to start login. Please check your Auth0 settings.');
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, started]);

  const handleContinue = async () => {
    setStatus(null);
    try {
      await loginWithRedirect({
        appState: { returnTo: '/' },
      });
    } catch (e) {
      console.error(e);
      setStatus('Unable to start login. Please check your Auth0 settings.');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Log In</h1>
      </header>

      <main className="dashboard-main">
        <p>Redirecting you to Auth0…</p>

        <button
          type="button"
          className={`btn-primary ${isLoading ? 'btn-disabled' : ''}`}
          onClick={handleContinue}
          disabled={isLoading}
        >
          Continue manually
        </button>

        <p style={{ marginTop: '1rem' }}>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
        {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
      </main>
    </div>
  );
};

export default Login;

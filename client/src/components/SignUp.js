'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const SignUp = () => {
  const { loginWithRedirect } = useAuth0();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: ''
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Signing up...');

    try {
      const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
      const response = await axios.post(`https://${auth0Domain}/dbconnections/signup`, {
        client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
        email: formData.email,
        password: formData.password,
        connection: process.env.REACT_APP_AUTH0_CONNECTION,
        user_metadata: {
          full_name: formData.fullName
        }
      });

      setStatus('Sign up successful! Redirecting to login...');
      await loginWithRedirect({
        authorizationParams: {
          login_hint: formData.email
        }
      });
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.description || error.response?.data?.message || error.message || 'Sign up failed. Check your Auth0 settings.';
      setStatus(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Create an Account</h1>
      </header>

      <main className="dashboard-main">
        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>

          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
      </main>
    </div>
  );
};

export default SignUp;

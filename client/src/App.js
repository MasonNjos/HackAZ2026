import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import CheckInForm from './components/CheckInForm';
import CreditsDashboard from './components/CreditsDashboard';
import SignUp from './components/SignUp';
import CheckInDashboard from './components/Checkin';

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "openid profile email"
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/credits" element={<CreditsDashboard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/checkin" element={<CheckInDashboard />} />
          </Routes>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App;

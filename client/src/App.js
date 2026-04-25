import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import CheckInForm from './components/CheckInForm';
import CreditsDashboard from './components/CreditsDashboard';
import SignUp from './components/SignUp';
import CheckInDashboard from './components/Checkin';

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  const authorizationParams = {
    // Auth0 compares callback URLs strictly; your dashboard uses a trailing slash.
    redirect_uri: `${window.location.origin}/`,
    scope: 'openid profile email',
    ...(audience && audience !== 'your-api-audience' ? { audience } : {}),
  };

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

function App() {
  return (
    <Router>
      <Auth0ProviderWithNavigate>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/credits" element={<CreditsDashboard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/checkin" element={<CheckInDashboard />} />
          </Routes>
        </div>
      </Auth0ProviderWithNavigate>
    </Router>
  );
}

export default App;

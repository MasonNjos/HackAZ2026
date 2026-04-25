import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import CreditsDashboard from './components/CreditsDashboard';
import SignUp from './components/SignUp';
import CheckInDashboard from './components/Checkin';
import Onboarding from './components/Onboarding';
import Login from './components/Login';

// ─── THE GATEKEEPER ───
const AuthGate = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div className="loading-screen">Loading Saguaro Link...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 1. Check account age (Timestamp Hack)
  const createdAt = new Date(user.updated_at || user.created_at).getTime();
  const now = new Date().getTime();
  const accountAgeInMinutes = (now - createdAt) / 1000 / 60;

  // 2. Check if they just finished onboarding in this session
  const hasFinishedOnboarding = sessionStorage.getItem(`onboarded_${user?.sub}`);

  // 3. Logic: If account is < 2 mins old AND they haven't finished the form yet
  const isNewUser = accountAgeInMinutes < 2 && !hasFinishedOnboarding;

  if (isNewUser) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: 'openid profile email',
      }}
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected Routes */}
            <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
            <Route path="/credits" element={<AuthGate><CreditsDashboard /></AuthGate>} />
            <Route path="/checkin" element={<AuthGate><CheckInDashboard /></AuthGate>} />
          </Routes>
        </div>
      </Auth0ProviderWithNavigate>
    </Router>
  );
}

export default App;
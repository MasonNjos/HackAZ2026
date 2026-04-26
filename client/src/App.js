import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import CheckInDashboard from './components/Checkin/Checkin';
import Onboarding from './components/Onboarding/Onboarding';
import Login from './components/Login';
import DoctorChat from './components/DoctorChat/DoctorChat'; // <── NEW IMPORT

// ─── THE GATEKEEPER ───
const AuthGate = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div className="loading-screen">Loading Saguaro Link...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const createdAt = new Date(user.updated_at || user.created_at).getTime();
  const now = new Date().getTime();
  const accountAgeInMinutes = (now - createdAt) / 1000 / 60;
  const hasFinishedOnboarding = sessionStorage.getItem(`onboarded_${user?.sub}`);

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
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected Routes */}
            <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
            <Route path="/checkin" element={<AuthGate><CheckInDashboard /></AuthGate>} />
            
            {/* ─── NEW DOCTOR CHAT ROUTE ─── */}
            <Route path="/chat" element={<AuthGate><DoctorChat /></AuthGate>} />
          </Routes>
        </div>
      </Auth0ProviderWithNavigate>
    </Router>
  );
}

export default App;
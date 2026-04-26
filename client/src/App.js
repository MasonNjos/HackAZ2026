import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './App.css';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import CheckInDashboard from './components/Checkin/Checkin';
import CheckinOptions from './components/Checkin/CheckinOptions';
import Onboarding from './components/Onboarding/Onboarding';
import Login from './components/Login';
import DoctorChat from './components/DoctorChat/DoctorChat'; // <── NEW IMPORT
import RequestRide from './components/RequestRide/RequestRide';
import History from './components/History/History'; // <── NEW IMPORT
import Rewards from './components/Rewards/Rewards';
import { LanguageProvider } from './contexts/LanguageContext';

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
    <LanguageProvider>
      <Router>
        <Auth0ProviderWithNavigate>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Protected Routes */}
              <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
              <Route path="/checkin-options" element={<AuthGate><CheckinOptions /></AuthGate>} />
              <Route path="/checkin" element={<AuthGate><CheckInDashboard /></AuthGate>} />
              
              {/* ─── NEW DOCTOR CHAT ROUTE ─── */}
              <Route path="/chat" element={<AuthGate><DoctorChat /></AuthGate>} />
              <Route path="/ride" element={<AuthGate><RequestRide /></AuthGate>} />
              <Route path="/history" element={<AuthGate><History /></AuthGate>} />
              <Route path="/rewards" element={<AuthGate><Rewards /></AuthGate>} />
            </Routes>
          </div>
        </Auth0ProviderWithNavigate>
      </Router>
    </LanguageProvider>
  );
}

export default App;
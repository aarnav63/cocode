import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import HackathonDetails from './pages/HackathonDetails';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Login from './pages/Login';
import Explore from './pages/Explore';
import History from './pages/History';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const refreshAccess = async () => {
      try {
        const res = await axios.post('/api/auth/refresh');
        const newToken = res.data.token;
        if (newToken) {
          axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          setIsAuthenticated(true);
        } else {
          delete axios.defaults.headers.common.Authorization;
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        delete axios.defaults.headers.common.Authorization;
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    refreshAccess();
  }, []);

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <Router>
          <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0' }}>
            <main className="main-content" style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Routes>
                <Route path="*" element={<Login />} />
              </Routes>
            </main>
          </div>
        </Router>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="app-container">
          <Navbar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <main className="main-content" style={{ width: '100%', flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/hackathon/:id" element={<HackathonDetails />} />
                <Route path="/organizer" element={<OrganizerDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

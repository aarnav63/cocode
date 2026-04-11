import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  // Use a placeholder or environment variable for Client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
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
                <Route path="/login" element={<Login />} />
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

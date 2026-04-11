import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import HackathonDetails from './pages/HackathonDetails';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Login from './pages/Login';
import Explore from './pages/Explore';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/hackathon/:id" element={<HackathonDetails />} />
            <Route path="/organizer" element={<OrganizerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

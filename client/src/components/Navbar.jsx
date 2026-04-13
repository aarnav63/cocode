import React from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const isAuthenticated = Boolean(userId);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    }

    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common.Authorization;
    navigate('/login');
    globalThis.location.reload();
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path || (path === '/profile/me' && location.pathname.startsWith('/profile/'));
    return {
      color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
      background: isActive ? 'rgba(78, 222, 163, 0.1)' : 'transparent',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontWeight: isActive ? 600 : 400,
      transition: 'all 0.2s ease',
      display: 'block'
    };
  };

  return (
    <nav className="sidebar">
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '3rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 700, letterSpacing: '-0.05em', fontSize: '2rem' }}>
          CoCode
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Code Collab Conquer</span>
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/" style={getLinkStyle('/')}>Dashboard</Link>
        {role !== 'organizer' && (
          <Link to="/explore" style={getLinkStyle('/explore')}>Explore & Match</Link>
        )}
        {isAuthenticated && role !== 'organizer' && (
          <Link to="/history" style={getLinkStyle('/history')}>History</Link>
        )}
        {role === 'organizer' && (
          <Link to="/organizer" style={getLinkStyle('/organizer')}>Organizer Mode</Link>
        )}
        {isAuthenticated && (
          <Link to="/profile/me" style={getLinkStyle('/profile/me')}>My Profile</Link>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>Logout</button>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Connect / Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

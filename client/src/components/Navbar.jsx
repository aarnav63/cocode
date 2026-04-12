import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="sidebar">
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '3rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 700, letterSpacing: '-0.05em', fontSize: '2rem' }}>
          CoCode
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Code Collab Conquer</span>
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link to="/" style={{ color: 'var(--on-surface)', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.5rem' }}>Dashboard</Link>
        {role !== 'organizer' && (
          <Link to="/explore" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', padding: '0.5rem' }}>Explore & Match</Link>
        )}
        {token && role !== 'organizer' && (
          <Link to="/history" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', padding: '0.5rem' }}>History</Link>
        )}
        {role === 'organizer' && (
          <Link to="/organizer" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', padding: '0.5rem' }}>Organizer Mode</Link>
        )}
        {token && (
          <Link to="/profile/me" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', padding: '0.5rem' }}>My Profile</Link>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        {!token ? (
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Connect / Login</Link>
        ) : (
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

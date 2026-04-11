import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer'); // Added role state
  const [location, setLocation] = useState(''); // Added location state
  const [skills, setSkills] = useState(''); // Added skills string
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isLogin) {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
        const res = await axios.post('http://localhost:5000/api/auth/register', {
          name, email, password, role, location, skills: skillsArray
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data._id);
        localStorage.setItem('role', res.data.role);
        alert('Signed up successfully!');
        navigate(res.data.role === 'organizer' ? '/organizer' : '/');
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email, password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data._id);
        localStorage.setItem('role', res.data.role);
        navigate(res.data.role === 'organizer' ? '/organizer' : '/');
      }
      // Force refresh to update navbar
      window.location.reload();
    } catch (error) {
      alert('Authentication Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">I am a...</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="developer">Developer</option>
                  <option value="organizer">Event Organizer</option>
                </select>
              </div>
              {role === 'developer' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Location</label>
                    <input type="text" className="input-field" placeholder="e.g. San Francisco, CA" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Skills (comma separated)</label>
                    <input type="text" className="input-field" placeholder="e.g. React, Node.js, Python" value={skills} onChange={e => setSkills(e.target.value)} />
                  </div>
                </>
              )}
            </>
          )}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--on-surface-variant)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    width="24px" 
    height="24px"
    style={{ marginRight: '10px' }}
  >
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
  </svg>
);

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [phone, setPhone] = useState('');
  
  // Google state
  const [requireOnboarding, setRequireOnboarding] = useState(false);
  const [googleId, setGoogleId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!requireOnboarding || location.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLocationSearching(true);
        const res = await axios.get(`/api/users/locations?query=${encodeURIComponent(location)}`);
        setLocationSuggestions(res.data || []);
      } catch (error) {
        console.error('Location autocomplete failed:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLocationSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [location, requireOnboarding]);

  const handleSelectLocation = (value) => {
    setLocation(value);
    setLocationSuggestions([]);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post('/api/auth/google', {
          access_token: tokenResponse.access_token,
        });

        if (res.data.requireOnboarding) {
          setRequireOnboarding(true);
          setEmail(res.data.email);
          setName(res.data.name);
          setGoogleId(res.data.googleId);
        } else {
          localStorage.setItem('userId', res.data._id);
          localStorage.setItem('role', res.data.role);
          navigate(res.data.role === 'organizer' ? '/organizer' : '/');
          window.location.reload();
        }
      } catch (error) {
        alert('Google Login failed: ' + (error.response?.data?.message || error.message));
      }
    },
    onError: error => console.log('Login Failed:', error)
  });

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const res = await axios.post('/api/auth/complete-profile', {
        name, email, googleId, role, location, phone, skills: skillsArray, githubUrl
      });
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('role', res.data.role);
      alert('Welcome! Profile completed.');
      navigate(res.data.role === 'organizer' ? '/organizer' : '/');
      window.location.reload();
    } catch (error) {
      alert('Authentication Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '3rem 2.5rem' }}>
        
        {!requireOnboarding ? (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontSize: '3.5rem', margin: '0 0 0.5rem 0' }}>
              CoCode
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
              Collab, Code and Conquer
            </p>
            <button 
              onClick={() => handleGoogleLogin()} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'var(--on-surface)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
        ) : (
          <form style={{ textAlign: 'left' }} onSubmit={handleSubmitProfile}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 'bold', textAlign: 'center' }}>
              Complete Your Profile
            </h2>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required disabled />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required disabled />
            </div>
            <div className="input-group">
              <label className="input-label">I am a...</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                <option value="developer">Developer</option>
                <option value="organizer">Event Organizer</option>
              </select>
            </div>
            {role === 'organizer' ? (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--on-surface-variant)', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <p>Organizations cannot register directly.</p>
                <p style={{ marginTop: '0.5rem' }}>Please contact dev to set up an organizer account.</p>
                <a href="mailto:bajajaarnav8@gmail.com" className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>Contact Dev</a>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label className="input-label">Mobile Number</label>
                  <input type="tel" className="input-field" placeholder="e.g. +1 555-123-4567" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="input-group" style={{ position: 'relative' }}>
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Location</span>
                    <span
                      style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '1rem' }}
                      title="Auto-fetch location via GPS"
                      tabIndex={0}
                      role="button"
                      onClick={async () => {
                        if (navigator.geolocation) {
                          setIsLocationSearching(true);
                          navigator.geolocation.getCurrentPosition(async (position) => {
                            try {
                              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
                              if (!response.ok) throw new Error('Reverse geocode failed');
                              const data = await response.json();
                              const addr = data.address || {};
                              const city = addr.city || addr.town || addr.state_district || addr.region || addr.county || addr.suburb || addr.municipality || addr.village || 'Unknown Region';
                              const state = addr.state || '';
                              setLocation(state ? `${city}, ${state}` : city);
                            } catch (err) {
                              console.error('Reverse geocode failed:', err);
                            } finally {
                              setIsLocationSearching(false);
                            }
                          }, () => {
                            setIsLocationSearching(false);
                          });
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.target.click();
                        }
                      }}
                    >
                      📍 Auto-fetch GPS
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Bangalore, India"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                    autoComplete="off"
                  />
                  {locationSuggestions.length > 0 && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: '8px', margin: '0.25rem 0 0 0', padding: 0, listStyle: 'none', maxHeight: '220px', overflowY: 'auto' }}>
                      {locationSuggestions.map(loc => (
                        <li
                          key={loc}
                          onMouseDown={() => handleSelectLocation(loc)}
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', color: 'var(--on-surface)' }}
                        >
                          {loc}
                        </li>
                      ))}
                    </ul>
                  )}
                  {isLocationSearching && <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>Searching locations…</div>}
                </div>
                <div className="input-group">
                  <label className="input-label">GitHub URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Skills (comma separated)</label>
                  <input type="text" className="input-field" placeholder="e.g. React, Node.js, Python" value={skills} onChange={e => setSkills(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Complete Profile
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

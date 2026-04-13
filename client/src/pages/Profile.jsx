import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ location: '', phone: '', skills: '', githubUrl: '' });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const endpoint = id === 'me' ? '/api/auth/me' : `/api/users/${id}/stats`;
        const res = await axios.get(endpoint);
        
        const u = res.data;
        setUser({
          ...u,
          role: u.role || 'Full-Stack Developer',
          location: u.location || 'Remote',
          email: u.email || '',
          phone: u.phone || '',
          githubUrl: u.githubUrl || '',
          skills: u.skills || [],
          trustScore: u.trustScore || { communication: 0, leadership: 0, reliability: 0, totalRatings: 0 },
          completedProjectsCount: u.completedProjectsCount || 0
        });
        setEditData({
          location: u.location || 'Remote',
          phone: u.phone || '',
          githubUrl: u.githubUrl || '',
          skills: (u.skills || []).join(', ')
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!isEditing || !editData.location || editData.location.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLocationSearching(true);
        const res = await axios.get(`/api/users/locations?query=${encodeURIComponent(editData.location)}`);
        setLocationSuggestions(res.data || []);
      } catch (err) {
        console.error('Location autocomplete failed:', err);
        setLocationSuggestions([]);
      } finally {
        setIsLocationSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [editData.location, isEditing]);

  const handleSaveProfile = async () => {
    try {
      const skillsArray = editData.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await axios.put('/api/users/profile', {
        location: editData.location,
        phone: editData.phone,
        githubUrl: editData.githubUrl,
        skills: skillsArray
      });
      
      setUser({ ...user, location: res.data.location, phone: res.data.phone, githubUrl: res.data.githubUrl, skills: res.data.skills });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile: ', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading profile...</div>;
  if (!user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Profile not found.</div>;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: user.role === 'organizer' ? '1fr' : '1fr 2fr' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--surface-lowest)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--primary)' }}>
          {user.name.charAt(0)}
        </div>
        <h2>{user.name}</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{user.role}</p>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Location</span>
                <span 
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      setIsLocationSearching(true);
                      navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
                          if (!response.ok) {
                            throw new Error('Reverse geocode failed');
                          }
                          const data = await response.json();
                          const addr = data.address || {};
                          const city = addr.city || addr.town || addr.state_district || addr.region || addr.county || addr.suburb || addr.municipality || addr.village || 'Unknown Region';
                          const state = addr.state || '';
                          setEditData(prev => ({...prev, location: state ? `${city}, ${state}` : city}));
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
                >
                  📍 Auto-fetch GPS
                </span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editData.location} 
                  autoComplete="off"
                  onChange={e => setEditData({...editData, location: e.target.value})}
                />

                {locationSuggestions.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: '8px', zIndex: 20, listStyle: 'none', padding: 0, margin: '0.25rem 0 0 0', maxHeight: '240px', overflowY: 'auto', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                    {locationSuggestions.map(loc => (
                      <li
                        key={loc}
                        onMouseDown={() => setEditData(prev => ({ ...prev, location: loc }))}
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', color: 'var(--on-surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}

                {isLocationSearching && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                    Searching locations...
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Phone</label>
              <input type="text" className="input-field" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>GitHub URL</label>
              <input type="url" className="input-field" placeholder="https://github.com/username" value={editData.githubUrl} onChange={e => setEditData({...editData, githubUrl: e.target.value})} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Skills (comma separated)</label>
              <input type="text" className="input-field" value={editData.skills} onChange={e => setEditData({...editData, skills: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleSaveProfile} style={{ flex: 1, padding: '0.5rem' }}>Save</button>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.5rem' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)' }}>
              📍 {user.location}
            </p>
            {user.email && (
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)' }}>
                ✉️ {user.email}
              </p>
            )}
            {user.phone && (
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)' }}>
                📞 {user.phone}
              </p>
            )}
            {user.githubUrl && (
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{user.githubUrl.replace(/^https?:\/\//, '')}</a>
              </p>
            )}
            
            <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
            
            {user.role !== 'organizer' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Skills</h3>
                  {(id === 'me' || localStorage.getItem('userId') === user._id) && (
                    <button className="btn btn-outline" onClick={() => setIsEditing(true)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                  {user.skills.map(s => (
                    <span key={s} className="pill-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {user.role !== 'organizer' && (
        <div className="glass-panel">
          <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Dev-Credit / Trust Score
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
              Based on {user.trustScore.totalRatings} project ratings
            </span>
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            This score is built exclusively from post-hackathon peer reviews. It cannot be spoofed.
          </p>

          <div className="grid gap-4">
            {Object.entries(user.trustScore).filter(([k]) => k !== 'totalRatings').map(([key, value]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{value.toFixed(1)} / 5.0</span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-lowest)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(value / 5) * 100}%`, background: 'var(--secondary)', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>

          {(() => {
            let title = 'Emerging Developer';
            let color = 'var(--on-surface-variant)';
            let rgb = '150, 150, 150';
            let text = 'This developer has not been rated yet. Give them a chance!';
            
            if (user.trustScore.totalRatings > 0) {
              const avg = (user.trustScore.communication + user.trustScore.leadership + user.trustScore.reliability) / 3;
              if (avg >= 4) {
                title = 'Highly Rated Developer';
                color = 'var(--secondary)';
                rgb = '78, 222, 163';
                text = 'This developer is top-tier and highly recommended by peers.';
              } else if (avg >= 2.5) {
                title = 'Solid Developer';
                color = '#f39c12';
                rgb = '243, 156, 18';
                text = 'This developer is a solid and reliable typical team member.';
              } else {
                title = 'Needs Improvement';
                color = '#ff6b6b';
                rgb = '255, 107, 107';
                text = 'This developer has received mixed feedback from previous teams.';
              }
            }

            return (
              <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: `rgba(${rgb}, 0.1)`, borderRadius: '12px', border: `1px solid rgba(${rgb}, 0.2)` }}>
                <h3 style={{ color }}>{title}</h3>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                  {user.name.split(' ')[0]} has effectively contributed to {user.completedProjectsCount} projects. {text}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Profile;

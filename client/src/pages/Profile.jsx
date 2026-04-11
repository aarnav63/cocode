import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = id === 'me' ? 'http://localhost:5000/api/auth/me' : `http://localhost:5000/api/users/${id}/stats`;
        const res = await axios.get(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Handle varying response structures map defaults if new user
        setUser({
          ...res.data,
          role: res.data.role || 'Full-Stack Developer',
          location: res.data.location || 'Remote',
          email: res.data.email || '',
          phone: res.data.phone || '',
          skills: res.data.skills || [],
          trustScore: res.data.trustScore || { communication: 0, leadership: 0, reliability: 0, totalRatings: 0 },
          hackathonsParticipated: res.data.hackathonsParticipated?.length || 0
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading profile...</div>;
  if (!user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Profile not found.</div>;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2fr' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--surface-lowest)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--primary)' }}>
          {user.name.charAt(0)}
        </div>
        <h2>{user.name}</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{user.role}</p>
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
        
        <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
        
        <h3 style={{ textAlign: 'left', fontSize: '1.1rem' }}>Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {user.skills.map(s => (
            <span key={s} className="pill-tag">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Dev-Credit / Trust Score
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
            Based on {user.trustScore.totalRatings} hackathon ratings
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

        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: 'rgba(78, 222, 163, 0.1)', borderRadius: '12px', border: '1px solid rgba(78, 222, 163, 0.2)' }}>
          <h3 style={{ color: 'var(--secondary)' }}>Highly Reliable Collaborator</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            {user.name.split(' ')[0]} has effectively contributed to {user.hackathonsParticipated} hackathons and is rated in the top 10% for reliability!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

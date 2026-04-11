import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ location: '', phone: '', skills: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = id === 'me' ? '/api/auth/me' : `/api/users/${id}/stats`;
        const res = await axios.get(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const u = res.data;
        setUser({
          ...u,
          role: u.role || 'Full-Stack Developer',
          location: u.location || 'Remote',
          email: u.email || '',
          phone: u.phone || '',
          skills: u.skills || [],
          trustScore: u.trustScore || { communication: 0, leadership: 0, reliability: 0, totalRatings: 0 },
          hackathonsParticipated: u.hackathonsParticipated?.length || 0
        });
        setEditData({
          location: u.location || 'Remote',
          phone: u.phone || '',
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

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const skillsArray = editData.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await axios.put('/api/users/profile', {
        location: editData.location,
        phone: editData.phone,
        skills: skillsArray
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setUser({ ...user, location: res.data.location, phone: res.data.phone, skills: res.data.skills });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile: ', err);
    }
  };

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

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Location</label>
              <input type="text" className="input-field" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>Phone</label>
              <input type="text" className="input-field" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
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
            
            <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
            
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
                {user.name.split(' ')[0]} has effectively contributed to {user.hackathonsParticipated} projects. {text}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Profile;

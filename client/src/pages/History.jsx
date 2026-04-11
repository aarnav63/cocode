import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const History = () => {
  const [historyProjects, setHistoryProjects] = useState([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratee, setRatee] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [ratingData, setRatingData] = useState({ communication: 3, leadership: 3, reliability: 3 });
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/projects/history', { headers: { Authorization: `Bearer ${token}` } });
        setHistoryProjects(res.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };
    fetchHistory();
  }, []);

  const openRateModal = (user, projectId) => {
    setRatee(user);
    setActiveProjectId(projectId);
    setRatingData({ communication: 3, leadership: 3, reliability: 3 });
    setShowRateModal(true);
  };

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ratings', {
        rateeId: ratee._id,
        hackathonId: activeProjectId,
        communication: ratingData.communication,
        leadership: ratingData.leadership,
        reliability: ratingData.reliability
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowRateModal(false);
      // Let's use standard alert for completion or just console log since alerts were annoying
      console.log('Rating submitted successfully!');
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const currentUserId = localStorage.getItem('userId');

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Project History</h1>
      
      {historyProjects.length === 0 ? (
        <p style={{ color: 'var(--on-surface-variant)' }}>You have no finished projects yet.</p>
      ) : (
        <div className="grid gap-6">
          {historyProjects.map(p => (
            <div key={p._id} className="glass-panel" style={{ border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--on-surface)' }}>{p.title}</h3>
                <span className="pill-tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--on-surface-variant)' }}>Finished</span>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{p.description}</p>
              
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--primary)' }}>Team Overview & Core Evaluation</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-lowest)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>👑</span>
                    <Link to={`/profile/${p.creatorId?._id}`} style={{ fontWeight: 600, color: 'var(--on-surface)', textDecoration: 'none' }}>
                      {p.creatorId?.name} {p.creatorId?._id === currentUserId ? '(You)' : ''}
                    </Link>
                  </div>
                  {p.creatorId?._id !== currentUserId && (
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openRateModal(p.creatorId, p._id)}>
                      Rate Team Leader
                    </button>
                  )}
                </div>
                
                {p.collaborators?.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-lowest)', borderRadius: '8px' }}>
                    <div>
                      <Link to={`/profile/${c._id}`} style={{ fontWeight: 600, color: 'var(--on-surface)', textDecoration: 'none' }}>
                        {c.name} {c._id === currentUserId ? '(You)' : ''}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{c.role}</div>
                    </div>
                    {c._id !== currentUserId && (
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openRateModal(c, p._id)}>
                        Rate Collaborator
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRateModal && ratee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Rate {ratee.name}</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>This directly influences their Dev-Credit Trust Score.</p>
            
            <form onSubmit={submitRating}>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Leadership & Initiative</span>
                  <span style={{ color: 'var(--primary)' }}>{ratingData.leadership} / 5</span>
                </label>
                <input type="range" min="1" max="5" step="1" value={ratingData.leadership} onChange={e => setRatingData({...ratingData, leadership: parseInt(e.target.value)})} style={{ width: '100%' }} />
              </div>

              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Communication</span>
                  <span style={{ color: 'var(--primary)' }}>{ratingData.communication} / 5</span>
                </label>
                <input type="range" min="1" max="5" step="1" value={ratingData.communication} onChange={e => setRatingData({...ratingData, communication: parseInt(e.target.value)})} style={{ width: '100%' }} />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reliability & Follow-through</span>
                  <span style={{ color: 'var(--primary)' }}>{ratingData.reliability} / 5</span>
                </label>
                <input type="range" min="1" max="5" step="1" value={ratingData.reliability} onChange={e => setRatingData({...ratingData, reliability: parseInt(e.target.value)})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Rating</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

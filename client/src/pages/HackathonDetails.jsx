import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const HackathonDetails = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ title: '', description: '' });
  const [skillInput, setSkillInput] = useState('');
  const role = localStorage.getItem('role');

  const fetchDetails = () => {
    axios.get(`/api/hackathons/${id}`)
      .then(res => setHackathon(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const requiredDevs = skillInput.split(',').map(s => ({ skill: s.trim() })).filter(s => s.skill);
      await axios.post('/api/projects', { ...newTeam, requiredDevs, hackathonId: id }, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateModal(false);
      setNewTeam({ title: '', description: '' });
      setSkillInput('');
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestJoin = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${teamId}/request`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${teamId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (teamId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${teamId}/accept/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (teamId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${teamId}/reject/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/projects/${teamId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (!hackathon) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Event...</div>;

  const currentUserId = localStorage.getItem('userId');
  const myTeam = hackathon?.teams?.find(team => team.creatorId === currentUserId || (team.creatorId && team.creatorId._id === currentUserId));
  const displayedTeams = hackathon?.teams || [];

  return (
    <div className="glass-panel">
      <h1 style={{ marginBottom: '0.5rem' }}>{hackathon.title}</h1>
      <p style={{ color: 'var(--primary)', marginBottom: '2rem' }}>{hackathon.location || 'Remote'} | {hackathon.startDate ? new Date(hackathon.startDate).toDateString() : ''}</p>
      
      <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        <div>
          <h3>About this Hackathon</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>{hackathon.description}</p>
          
          <h3>Rules & Guidelines</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>{hackathon.rules || 'No specific rules provided.'}</p>
        </div>
        
        {role !== 'organizer' && (
          <div className="glass-panel" style={{ background: 'var(--surface-lowest)', border: 'none' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--on-surface)' }}>Join the Action</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {myTeam ? (
                <button className="btn btn-outline" style={{ flex: 1, marginBottom: '1rem', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                  You already created a team for this event
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, marginBottom: '1rem' }} onClick={() => setShowCreateModal(true)}>
                  Create Team
                </button>
              )}
            </div>
            
            <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
            
            <h4 style={{ marginBottom: '1rem', color: 'var(--on-surface)' }}>Teams looking for members</h4>
            {displayedTeams.length > 0 ? displayedTeams.map(team => (
               <div key={team._id} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--on-surface)' }}>{team.title || 'Anonymous Team'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                    ({1 + (team.collaborators?.length || 0)} Member{1 + (team.collaborators?.length || 0) === 1 ? '' : 's'})
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
                  {team.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                  {team.requiredDevs && team.requiredDevs.map((r, i) => (
                    <span key={i} className="pill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', textDecoration: r.fulfilled ? 'line-through' : 'none', opacity: r.fulfilled ? 0.5 : 1 }}>
                      {r.skill}
                    </span>
                  ))}
                </div>
                {(() => {
                  const isOwner = team.creatorId?._id === currentUserId || team.creatorId === currentUserId;
                  const isRequested = (team.requests || []).some(reqId => reqId === currentUserId || reqId?._id === currentUserId);
                  const isCollaborator = team.collaborators && team.collaborators.some(collab => collab === currentUserId || collab?._id === currentUserId);

                  if (isOwner) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ background: 'rgba(98, 168, 255, 0.08)', border: '1px solid rgba(98, 168, 255, 0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                          <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)' }}>Pending Requests</h4>
                          {team.requests && team.requests.length > 0 ? (
                            team.requests.map(req => {
                              const requestUserId = req._id || req;
                              return (
                                <div key={requestUserId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div>
                                    <div style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{req.name || 'Pending Developer'}</div>
                                    {req.role && <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{req.role}</div>}
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleAcceptRequest(team._id, requestUserId)}>
                                      Accept
                                    </button>
                                    <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: '#ff6b6b', color: '#ff6b6b' }} onClick={() => handleRejectRequest(team._id, requestUserId)}>
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>No pending requests yet.</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', flex: 1 }} onClick={() => handleDeleteTeam(team._id)}>
                            Delete Team
                          </button>
                          <span style={{ color: 'var(--primary)', fontSize: '0.875rem', display: 'block', textAlign: 'center', flex: 1, alignSelf: 'center' }}>
                            Your Team
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (isCollaborator) {
                    return (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', flex: 1 }} onClick={() => handleLeaveTeam(team._id)}>
                          Leave Team
                        </button>
                        <span style={{ color: 'var(--primary)', fontSize: '0.875rem', display: 'block', textAlign: 'center', flex: 1, alignSelf: 'center' }}>
                          Joined
                        </span>
                      </div>
                    );
                  }

                  if (isRequested) {
                    return <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%', opacity: 0.5 }} disabled>Requested</button>;
                  }

                  return <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%' }} onClick={() => handleRequestJoin(team._id)}>Request to Join</button>;
                })()}
              </div>
            )) : <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No open teams currently listed.</p>}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create a Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="input-group">
                <label className="input-label">Team / Project Name</label>
                <input type="text" required className="input-field" value={newTeam.title} onChange={e => setNewTeam({...newTeam, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Project Description</label>
                <textarea required className="input-field" rows="3" value={newTeam.description} onChange={e => setNewTeam({...newTeam, description: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Required Skills (Comma separated)</label>
                <input type="text" className="input-field" placeholder="e.g. React, Node.js" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonDetails;

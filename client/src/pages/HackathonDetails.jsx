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

  if (!hackathon) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Event...</div>;

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
              <button className="btn btn-primary" style={{ flex: 1, marginBottom: '1rem' }} onClick={() => setShowCreateModal(true)}>Create Team</button>
            </div>
            
            <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
            
            <h4 style={{ marginBottom: '1rem', color: 'var(--on-surface)' }}>Teams looking for members</h4>
            {hackathon.teams && hackathon.teams.length > 0 ? hackathon.teams.map(team => (
               <div key={team._id} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--on-surface)' }}>{team.title || 'Anonymous Team'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>({team.collaborators?.length || 0} Members)</span>
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
                {team.creatorId?._id !== localStorage.getItem('userId') && (
                  (() => {
                    const isRequested = (team.requests || []).includes(localStorage.getItem('userId'));
                    const isCollaborator = team.collaborators && team.collaborators.includes(localStorage.getItem('userId'));

                    if (isCollaborator) return <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%', opacity: 0.5 }} disabled>Joined</button>;
                    if (isRequested) return <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%', opacity: 0.5 }} disabled>Requested</button>;
                    
                    return <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%' }} onClick={() => handleRequestJoin(team._id)}>Request to Join</button>;
                  })()
                )}
                {team.creatorId?._id === localStorage.getItem('userId') && (
                  <span style={{ color: 'var(--primary)', fontSize: '0.875rem', display: 'block', textAlign: 'center' }}>Your Team</span>
                )}
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

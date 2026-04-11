import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const HackathonDetails = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/hackathons/${id}`)
      .then(res => setHackathon(res.data))
      .catch(err => console.error(err));
  }, [id]);

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
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Register as Individual</button>
            
            <hr style={{ borderColor: 'var(--outline-variant)', margin: '1.5rem 0' }} />
            
            <h4 style={{ marginBottom: '1rem', color: 'var(--on-surface)' }}>Teams looking for members</h4>
            {hackathon.teams && hackathon.teams.length > 0 ? hackathon.teams.map(team => (
               <div key={team._id} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--on-surface)' }}>{team.name || 'Anonymous Team'}</strong>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: '100%' }}>Request to Join</button>
              </div>
            )) : <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No open teams currently listed.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonDetails;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Dynamic fetch to replace static mock events
    axios.get('/api/hackathons')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Organizer Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
        <button 
          className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('create')}
        >
          Create New Hackathon
        </button>
      </div>

      <div className="glass-panel">
        {activeTab === 'events' ? (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Active Events</h2>
            {events.length > 0 ? events.map(e => (
              <div key={e._id} style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{e.title}</h3>
                  <span style={{ background: 'rgba(78, 222, 163, 0.2)', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>
                    {e.isOpen ? 'Live Registration' : 'Closed'}
                  </span>
                </div>
                
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '2rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>{e.participants?.length || 0}</div>
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Registered Users</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>{e.teams?.length || 0}</div>
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Teams Formed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>-</div>
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Days until event</div>
                  </div>
                </div>
              </div>
            )) : <p style={{ color: 'var(--on-surface-variant)' }}>No active events found. Create one from the tab above.</p>}
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Hackathon</h2>
            <form style={{ maxWidth: '600px' }} onSubmit={e => e.preventDefault()}>
              <div className="input-group">
                <label className="input-label">Event Title</label>
                <input type="text" className="input-field" placeholder="e.g. Web3 Builders League" />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input type="date" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="4" placeholder="Describe the hackathon..."></textarea>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Publish Hackathon</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;

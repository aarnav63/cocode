import React, { useState, useEffect } from 'react';
import axios from 'axios';

const formatDateStr = (dateString) => {
  if (!dateString) return 'Invalid Date';
  const dt = new Date(dateString);
  if (isNaN(dt.getTime())) return 'Invalid Date';
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '', description: '', startDate: '', endDate: '', location: '', rules: ''
  });

  const fetchEvents = () => {
    axios.get('/api/hackathons')
      .then(res => {
        // filter events to only show those by this organizer
        const mine = res.data.filter(h => h.organizerId._id === localStorage.getItem('userId') || h.organizerId === localStorage.getItem('userId'));
        setEvents(mine);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hackathons', formData);
      setFormData({ title: '', description: '', startDate: '', endDate: '', location: '', rules: '' });
      setActiveTab('events');
      fetchEvents();
      console.log('Hackathon created successfully');
    } catch (err) {
      console.error('Error creating hackathon:', err);
    }
  };

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
                <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                  <span>📍 {e.location}</span> | <span>🗓️ {formatDateStr(e.startDate)} - {formatDateStr(e.endDate)}</span>
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
                    <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      {Math.max(0, Math.ceil((new Date(e.startDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                    </div>
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>Days until event</div>
                  </div>
                </div>
              </div>
            )) : <p style={{ color: 'var(--on-surface-variant)' }}>No active events found. Create one from the tab above.</p>}
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Hackathon</h2>
            <form style={{ maxWidth: '600px' }} onSubmit={handleCreateHackathon}>
              <div className="input-group">
                <label className="input-label">Event Title</label>
                <input type="text" required className="input-field" placeholder="e.g. Web3 Builders League" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Start Date</label>
                  <input type="date" required className="input-field" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">End Date</label>
                  <input type="date" required className="input-field" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label className="input-label">Location (or "Remote")</label>
                <input type="text" required className="input-field" placeholder="e.g. San Francisco, CA" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea required className="input-field" rows="3" placeholder="Overview of the hackathon..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Rules / Judging Criteria</label>
                <textarea className="input-field" rows="3" placeholder="Event rules..." value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Publish Hackathon</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;

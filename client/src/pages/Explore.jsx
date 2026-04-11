import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Explore = () => {
  const role = localStorage.getItem('role');
  const [activeTab, setActiveTab] = useState('projects'); // projects or devs
  const [projects, setProjects] = useState([]);
  const [devs, setDevs] = useState([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Fetch all projects (Hackathons and generic Projects)
  const fetchProjects = async () => {
    try {
      const [hacksRes, projRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hackathons'),
        axios.get('http://localhost:5000/api/projects')
      ]);
      const formattedHacks = hacksRes.data.map(h => ({ ...h, type: 'Hackathon', required: [], creatorId: h.organizerId }));
      const formattedProjects = projRes.data.map(p => ({ ...p, type: 'Project', required: p.requiredDevs || [], location: p.creatorId?.location || 'Remote', startDate: 'Flexible', creatorId: p.creatorId?._id || p.creatorId }));
      
      setProjects([...formattedHacks, ...formattedProjects]);
    } catch (e) {
      console.error('Error fetching projects:', e);
      setProjects([]);
    }
  };

  const handleRequestJoin = async (projId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/projects/${projId}/request`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update UI instantaneously
      setProjects(projects.map(p => {
        if(p._id === projId) {
          return { ...p, requests: [...(p.requests || []), localStorage.getItem('userId')] };
        }
        return p;
      }));
      alert("Successfully requested to join!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Fetch developers based on filters
  const fetchDevs = async () => {
    try {
      const query = new URLSearchParams();
      if (skillFilter) query.append('skill', skillFilter);
      if (locationFilter) query.append('location', locationFilter);
      
      const res = await axios.get(`http://localhost:5000/api/users/developers?${query.toString()}`);
      setDevs(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'projects') fetchProjects();
    else fetchDevs();
  }, [activeTab]);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Explore & Match</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('projects')}>
          Browse Projects & Events
        </button>
        <button className={`btn ${activeTab === 'devs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('devs')}>
          Find Developers
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div className="grid gap-6">
          {projects.map(p => (
            <div key={p._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>{p.title}</h3>
                  <span className={`pill-tag ${p.type === 'Hackathon' ? 'success' : ''}`}>{p.type}</span>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{p.description}</p>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ marginRight: '1rem' }}>📍 {p.location}</span>
                  <span>🗓️ {p.startDate}</span>
                </div>
              </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {/* Handle legacy array of strings or new array of objects */}
                  {p.required.map((r, i) => <span key={i} className="pill-tag" style={{ textDecoration: r.fulfilled ? 'line-through' : 'none', opacity: r.fulfilled ? 0.5 : 1 }}>
                    {typeof r === 'string' ? r : `${r.count}x ${r.skill}`}
                  </span>)}
                </div>
                {role !== 'organizer' && p.creatorId !== localStorage.getItem('userId') && (
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: '1rem', opacity: (p.requests || []).includes(localStorage.getItem('userId')) ? 0.5 : 1 }} 
                    onClick={() => handleRequestJoin(p._id)}
                    disabled={(p.requests || []).includes(localStorage.getItem('userId'))}
                  >
                    {(p.requests || []).includes(localStorage.getItem('userId')) ? 'Requested' : 'Request to Join'}
                  </button>
                )}
                {p.creatorId === localStorage.getItem('userId') && (
                  <span style={{ marginTop: '1rem', color: 'var(--primary)' }}>Your Project</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="glass-panel" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem' }}>
            <input type="text" className="input-field" placeholder="Filter by Skill (e.g. React)" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} />
            <input type="text" className="input-field" placeholder="Filter by Location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            <button className="btn btn-primary" onClick={fetchDevs}>Search</button>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {devs.map(dev => (
              <div key={dev._id} className="glass-panel" style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '0.25rem' }}>{dev.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>📍 {dev.location || 'Remote'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {dev.skills.map(s => <span key={s} className="pill-tag">{s}</span>)}
                </div>
                <button className="btn btn-outline" style={{ width: '100%' }}>View Profile</button>
              </div>
            ))}
            {devs.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>No developers found. Try adjusting filters.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

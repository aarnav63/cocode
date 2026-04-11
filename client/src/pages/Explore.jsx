import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Explore = () => {
  const role = localStorage.getItem('role');
  const [activeTab, setActiveTab] = useState('projects'); // projects or devs
  const [projects, setProjects] = useState([]);
  const [devs, setDevs] = useState([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Fetch all projects (Hackathons and generic Projects)
  const fetchProjects = async () => {
    try {
      const [hacksRes, projRes] = await Promise.all([
        axios.get('/api/hackathons'),
        axios.get('/api/projects')
      ]);
      const formattedHacks = hacksRes.data.map(h => ({ ...h, type: 'Hackathon', required: [], creatorId: h.organizerId }));
      const formattedProjects = projRes.data.map(p => ({ ...p, type: 'Project', required: p.requiredDevs || [], location: p.creatorId?.location || 'Remote', startDate: 'Flexible', creatorId: p.creatorId?._id || p.creatorId, collaborators: p.collaborators || [], rejected: p.rejected || [] }));
      
      const currentUserId = localStorage.getItem('userId');
      setProjects([...formattedHacks, ...formattedProjects].filter(p => !p.rejected?.includes(currentUserId)));
    } catch (e) {
      console.error('Error fetching projects:', e);
      setProjects([]);
    }
  };

  const handleRequestJoin = async (projId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${projId}/request`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update UI instantaneously
      setProjects(projects.map(p => {
        if(p._id === projId) {
          return { ...p, requests: [...(p.requests || []), localStorage.getItem('userId')] };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error requesting to join: ', err.response?.data?.message || err.message);
    }
  };

  // Fetch developers based on filters
  const fetchDevs = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const query = new URLSearchParams();
      if (skillFilter) query.append('skill', skillFilter);
      if (locationFilter) query.append('location', locationFilter);
      
      const res = await axios.get(`/api/users/developers?${query.toString()}`);
      setDevs(res.data.filter(dev => dev._id !== currentUserId));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'projects') fetchProjects();
    else fetchDevs();
  }, [activeTab]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [skillsRes, locsRes] = await Promise.all([
          axios.get('/api/users/skills'),
          axios.get('/api/users/locations')
        ]);
        setAvailableSkills(skillsRes.data);
        
        const hardcodedCities = ["Remote", "Bangalore, India", "Mumbai, India", "New Delhi, India", "Hyderabad, India", "Pune, India", "Chennai, India", "Gurgaon, India", "Noida, India", "Ahmedabad, India", "Kolkata, India", "San Francisco, CA", "New York, NY", "London, UK", "Toronto, ON", "Berlin, Germany", "Seattle, WA"];
        const uniqueLocs = Array.from(new Set([...locsRes.data, ...hardcodedCities]));
        setAvailableLocations(uniqueLocs);
      } catch (e) {
        console.error('Error fetching dropdowns:', e);
      }
    };
    fetchDropdowns();
  }, []);

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
                    {typeof r === 'string' ? r : r.skill}
                  </span>)}
                </div>
                {role !== 'organizer' && p.creatorId !== localStorage.getItem('userId') && (
                  (() => {
                    const isRequested = (p.requests || []).includes(localStorage.getItem('userId'));
                    const isCollaborator = p.collaborators && p.collaborators.some(collab => collab === localStorage.getItem('userId') || collab._id === localStorage.getItem('userId'));

                    if (isCollaborator) {
                      return (
                        <button className="btn btn-primary" style={{ marginTop: '1rem', opacity: 0.5 }} disabled>
                          Joined
                        </button>
                      );
                    }
                    if (isRequested) {
                      return (
                        <button className="btn btn-primary" style={{ marginTop: '1rem', opacity: 0.5 }} disabled>
                          Requested
                        </button>
                      );
                    }
                    return (
                      <button 
                        className="btn btn-primary" 
                        style={{ marginTop: '1rem' }} 
                        onClick={() => handleRequestJoin(p._id)}
                      >
                        Request to Join
                      </button>
                    );
                  })()
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
          <div className="glass-panel" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', overflow: 'visible' }}>
            
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Filter by Skill (e.g. React)" 
                autoComplete="off"
                value={skillFilter} 
                onChange={e => setSkillFilter(e.target.value)} 
                style={{ width: '100%' }}
              />
              {(() => {
                const filtered = availableSkills.filter(s => s.toLowerCase().includes(skillFilter.toLowerCase()) && skillFilter !== s);
                if (filtered.length === 0 || skillFilter === '') return null;
                return (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--primary)', borderRadius: '8px', zIndex: 100, listStyle: 'none', padding: '0.5rem 0', margin: '0.25rem 0 0 0', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.7)' }}>
                    {filtered.map(s => (
                      <li 
                        key={s} 
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--on-surface)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}
                        onMouseDown={() => setSkillFilter(s)}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(78, 222, 163, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
            
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Filter by Location" 
                autoComplete="off"
                value={locationFilter} 
                onChange={e => setLocationFilter(e.target.value)} 
                style={{ width: '100%' }}
              />
              {(() => {
                const filtered = availableLocations.filter(c => c.toLowerCase().includes(locationFilter.toLowerCase()) && locationFilter !== c);
                if (filtered.length === 0 || locationFilter === '') return null;
                return (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--primary)', borderRadius: '8px', zIndex: 100, listStyle: 'none', padding: '0.5rem 0', margin: '0.25rem 0 0 0', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.7)' }}>
                    {filtered.map(c => (
                      <li 
                        key={c} 
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--on-surface)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}
                        onMouseDown={() => setLocationFilter(c)}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(78, 222, 163, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
            
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
                <Link to={`/profile/${dev._id}`} className="btn btn-outline" style={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }}>
                  View Profile
                </Link>
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

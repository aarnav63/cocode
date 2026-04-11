import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const role = localStorage.getItem('role');
  const [userName, setUserName] = useState('');
  
  const [hackathons, setHackathons] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredDevs, setRequiredDevs] = useState('');

  useEffect(() => {
    axios.get('/api/hackathons')
      .then(res => setHackathons(res.data))
      .catch(err => console.error('Error fetching hackathons:', err));

    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUserName(res.data.name || ''))
        .catch(() => setUserName(''));
    }

    if (token && role !== 'organizer') {
      axios.get('/api/projects/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setMyProjects(res.data))
        .catch(err => console.error('Error fetching my projects', err));

      axios.get('/api/projects/joined', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setJoinedProjects(res.data))
        .catch(err => console.error('Error fetching joined projects', err));
    }
  }, [role]);

  const acceptRequest = async (projId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/projects/${projId}/accept/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch(err) { alert('Error accepting request: ' + err.message); }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const devsArray = requiredDevs.split(',').map(s => {
        let count = 1;
        let skill = s.trim();
        const match = skill.match(/^(\d+)\s+(.+)$/);
        if (match) {
          count = parseInt(match[1], 10);
          skill = match[2].trim();
        }
        return { skill, count, fulfilled: false };
      }).filter(s => s.skill);

      await axios.post('/api/projects', 
        { title, description, requiredDevs: devsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Project created successfully!');
      setShowModal(false);
      setTitle(''); setDescription(''); setRequiredDevs('');
      window.location.reload();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  return (
    <div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Devs Needed (Comma separated skills)</label>
                <input type="text" className="input-field" placeholder="e.g. 1 React, 2 Node" value={requiredDevs} onChange={e => setRequiredDevs(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3rem', color: 'var(--on-surface)' }}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
            What are you building today?
          </p>
        </div>
        {role !== 'organizer' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create New Project</button>
        )}
      </header>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Hackathons</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hackathons.map(h => (
              <div key={h._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{h.title}</h3>
                    <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{new Date(h.date).toDateString()}</p>
                  </div>
                  <Link to={`/hackathon/${h._id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                    Inspect
                  </Link>
                </div>
                <p style={{ color: 'var(--on-surface-variant)' }}>{h.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {h.tags.map(tag => (
                    <span key={tag} className="pill-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ marginTop: '3rem' }}>
        {role !== 'organizer' && myProjects.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>My Active Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myProjects.map(p => (
                <div key={p._id} className="glass-panel">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{p.title}</h3>
                  <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{p.description}</p>
                  
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--on-surface)' }}>Required Developers</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {p.requiredDevs.map(r => (
                      <span key={r._id} className="pill-tag" style={{ background: r.fulfilled ? 'var(--surface-container)' : 'var(--surface-highest)', textDecoration: r.fulfilled ? 'line-through': 'none', opacity: r.fulfilled ? 0.5 : 1 }}>
                        {r.count}x {r.skill}
                      </span>
                    ))}
                  </div>

                  {/* ACCEPTED COLLABORATORS SECTION */}
                  {p.collaborators && p.collaborators.length > 0 && (
                    <>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Accepted Collaborators</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {p.collaborators.map(collab => (
                          <div key={collab._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(78, 222, 163, 0.1)', border: '1px solid var(--secondary)', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{collab.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{collab.email} • {collab.phone}</div>
                            </div>
                            <Link to={`/profile/${collab._id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: 'var(--secondary)', color: 'var(--background)' }}>
                              View Profile
                            </Link>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--on-surface)' }}>Pending Requests to Join</h4>
                  {p.requests && p.requests.length > 0 ? (
                    p.requests.map(req => (
                      <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--surface-lowest)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{req.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{req.role}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/profile/${req._id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                            View Profile
                          </Link>
                          <button onClick={() => acceptRequest(p._id, req._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                            Accept
                          </button>
                        </div>
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No developers have requested to join yet.</p>}

                  <button
                    className="btn btn-outline"
                    style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.put(`/api/projects/${p._id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
                        window.location.reload();
                      } catch (err) {
                        alert('Error marking developers found: ' + err.message);
                      }
                    }}
                  >
                    Developers Found (Close Project)
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* NEW SECTION: PROJECTS I'VE JOINED */}
      <section style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
        {role !== 'organizer' && joinedProjects.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Projects I've Joined</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {joinedProjects.map(p => (
                <div key={p._id} className="glass-panel" style={{ border: '1px solid var(--secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="pill-tag success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>✓ Request Accepted</span>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--secondary)' }}>{p.title}</h3>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Led by: {p.creatorId?.name}</span>
                  </div>
                  <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>{p.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  );
};

export default Home;

import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer" style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'fit-content',
      padding: '10px 24px',
      background: 'rgba(23, 31, 51, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '9999px',
      zIndex: 1000,
      color: 'var(--on-surface-variant)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
          Made with ❤️ by 
          <span style={{ fontWeight: 'bold', color: 'var(--primary)', marginLeft: '4px' }}>Aarnav</span>
        </p>
        
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a 
             href="https://github.com/aarnav63" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none', fontWeight: '500' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0077b5'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--on-surface-variant)'}
          >
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/aarnav-bajaj-b70088363/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none', fontWeight: '500' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0077b5'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--on-surface-variant)'}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

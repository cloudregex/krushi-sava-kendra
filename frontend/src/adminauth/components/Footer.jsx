import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '12px 25px',
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        fontSize: '12px',
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Copyright © 2026 <strong style={{ color: '#1e293b' }}>Krushi Seva Kendra</strong>. Designed with ❤️ by <a href="https://cloudregex.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', fontWeight: '700', textDecoration: 'none' }}>Cloud Regex</a>
      </div>
    </footer>
  );
};

export default Footer;


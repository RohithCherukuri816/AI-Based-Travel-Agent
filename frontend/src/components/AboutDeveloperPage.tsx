import React from 'react';

const AboutDeveloperPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center', 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: '#fff',
      borderRadius: '1.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#6a0dad', marginBottom: '1rem' }}>About the Developer</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        This application was built by a skilled developer passionate about creating innovative solutions.
      </p>
      <p style={{ fontSize: '1rem', color: '#888', marginTop: '1rem' }}>
        For more information or to connect, please visit their professional portfolio.
      </p>
    </div>
  );
};

export default AboutDeveloperPage;
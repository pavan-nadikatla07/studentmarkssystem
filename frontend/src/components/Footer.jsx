import React from 'react';

const Footer = () => {
  return (
    <footer className="portal-footer no-print">
      <div className="footer-content">
        <div>
          <strong>Online Examination Result Portal</strong> &mdash; MERN Stack Mini Project
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
          Powered by ReactJS, ExpressJS, NodeJS &amp; MongoDB Atlas &bull; Role-Based Authorization
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">S-Techdy</div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

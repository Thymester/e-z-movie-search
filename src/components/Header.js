import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/" className="nav-link">
          Evolution of Web Design
          </Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/modernpage" className="nav-link">
                Modern Site
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

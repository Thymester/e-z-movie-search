import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MovieSearch from './components/MovieSearch';
import TVShowSearch from './components/TVShowSearch';
import './App.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <h1 className="homepage-title">Welcome to E-Z Movie Search</h1>
        <p className="homepage-description">
          Explore movies and TV shows with ease!
        </p>
        <div className="homepage-links">
          <Link to="/movies" className="homepage-link">
            Explore Movies
          </Link>
          <Link to="/tvshows" className="homepage-link">
            Explore TV Shows
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedMediaType, setSelectedMediaType] = useState('movies');

  const handleMediaTypeChange = (mediaType) => {
    setSelectedMediaType(mediaType);
  };

  return (
    <Router>
      <div className="navbar">
          <Link
            to="/movies"
            className={`navbar-button ${selectedMediaType === 'movies' ? 'selected' : ''}`}
            onClick={() => handleMediaTypeChange('movies')}
          >
            Movies
          </Link>
          <Link
            to="/tvshows"
            className={`navbar-button ${selectedMediaType === 'tvShows' ? 'selected' : ''}`}
            onClick={() => handleMediaTypeChange('tvShows')}
          >
            TV Shows
          </Link>
          <Link to="/" className="navbarh1">E-Z Movie Search</Link>
      </div>
        <div>
          <div className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies/*" element={<MovieSearch />} />
              <Route path="/tvshows/*" element={<TVShowSearch />} />
            </Routes>
          </div>
        </div>
    </Router>
  );
}

export default App;

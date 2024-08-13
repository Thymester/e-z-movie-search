import React, { useState, useEffect } from 'react';
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
      </div>
    </div>
  );
};

function App() {
  const [selectedMediaType, setSelectedMediaType] = useState(() => {
    // Use localStorage to retrieve the last selected media type
    return localStorage.getItem('selectedMediaType') || 'movies';
  });

  const handleMediaTypeChange = (mediaType) => {
    setSelectedMediaType(mediaType);
    // Save the selected media type to localStorage
    localStorage.setItem('selectedMediaType', mediaType);
  };

  useEffect(() => {
    // Set the selected media type from localStorage on component mount
    const storedMediaType = localStorage.getItem('selectedMediaType');
    if (storedMediaType) {
      setSelectedMediaType(storedMediaType);
    }
  }, []);

  return (
    <Router>
      <div className="navbar">
        <Link
          to="/"
          className={`media-link ${selectedMediaType === 'home' ? 'selected' : ''}`}
          onClick={() => handleMediaTypeChange('home')}
        >
          Home
        </Link>
        <Link
          to="/movies"
          className={`media-link ${selectedMediaType === 'movies' ? 'selected' : ''}`}
          onClick={() => handleMediaTypeChange('movies')}
        >
          Movies
        </Link>
        <Link
          to="/tvshows"
          className={`media-link ${selectedMediaType === 'tvShows' ? 'selected' : ''}`}
          onClick={() => handleMediaTypeChange('tvShows')}
        >
          TV Shows
        </Link>
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

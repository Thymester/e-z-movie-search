import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MovieSearch from './components/MovieSearch';
import TVShowSearch from './components/TVShowSearch';
import './App.css';

function App() {
  const [selectedMediaType, setSelectedMediaType] = useState('movies');

  const handleMediaTypeChange = (mediaType) => {
    setSelectedMediaType(mediaType);
  };

  return (
    <Router>
      <div>
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
          <h1 className="navbarh1">E-Z Movie Search</h1>
        </div>
        <div className="content">
          <Routes>
            <Route path="/movies/*" element={<MovieSearch />} />
            <Route path="/tvshows/*" element={<TVShowSearch />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieSearch from './components/MovieSearch';
import TVShowSearch from './components/TVShowSearch';
import './App.css';

const API_KEY = 'c95b317e79468f9ab81e1b6511e28c0d';

const HomePage = () => {
  const [orbitItems, setOrbitItems] = useState([]);

  useEffect(() => {
    const fetchOrbitContent = async () => {
      try {
        // Fetch popular movies
        const moviesResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`
        );
        
        // Fetch popular TV shows
        const tvResponse = await axios.get(
          `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&page=1`
        );

        // Combine and shuffle the results, take 15 random items
        const allContent = [
          ...moviesResponse.data.results.slice(0, 10).map(item => ({
            ...item,
            type: 'movie',
            image: item.poster_path,
            title: item.title
          })),
          ...tvResponse.data.results.slice(0, 10).map(item => ({
            ...item,
            type: 'tv',
            image: item.poster_path,
            title: item.name
          }))
        ];

        // Shuffle and take 15 items
        const shuffled = allContent.sort(() => 0.5 - Math.random()).slice(0, 15);
        setOrbitItems(shuffled);

      } catch (error) {
        console.error('Error fetching orbit content:', error);
        // Fallback to empty array if API fails
        setOrbitItems([]);
      }
    };

    fetchOrbitContent();
  }, []);

  return (
    <div className="homepage">
      <div className="orbit-container">
        {/* First orbit ring - 4 items */}
        <div className="orbit-ring orbit-ring-1">
          {orbitItems.slice(0, 4).map((item, index) => (
            <div key={`ring1-${item.id}`} className="orbit-item" style={{
              top: ['0%', '25%', '100%', '25%'][index],
              left: ['50%', '100%', '50%', '0%'][index],
              transform: 'translate(-50%, -50%)'
            }}>
              {item.image ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${item.image}`} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.fontSize = '1.2rem';
                    e.target.parentElement.innerHTML = item.type === 'movie' ? '🎬' : '📺';
                  }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>
                  {item.type === 'movie' ? '🎬' : '📺'}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Second orbit ring - 5 items */}
        <div className="orbit-ring orbit-ring-2">
          {orbitItems.slice(4, 9).map((item, index) => (
            <div key={`ring2-${item.id}`} className="orbit-item orbit-item-2" style={{
              top: ['0%', '19.1%', '100%', '80.9%', '80.9%'][index],
              left: ['50%', '95.1%', '50%', '95.1%', '4.9%'][index],
              transform: 'translate(-50%, -50%)'
            }}>
              {item.image ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${item.image}`} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.fontSize = '1.2rem';
                    e.target.parentElement.innerHTML = item.type === 'movie' ? '🎬' : '📺';
                  }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>
                  {item.type === 'movie' ? '🎬' : '📺'}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Third orbit ring - 6 items */}
        <div className="orbit-ring orbit-ring-3">
          {orbitItems.slice(9, 15).map((item, index) => (
            <div key={`ring3-${item.id}`} className="orbit-item orbit-item-3" style={{
              top: ['0%', '13.4%', '86.6%', '100%', '86.6%', '13.4%'][index],
              left: ['50%', '93.3%', '93.3%', '50%', '6.7%', '6.7%'][index],
              transform: 'translate(-50%, -50%)'
            }}>
              {item.image ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${item.image}`} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.fontSize = '1.2rem';
                    e.target.parentElement.innerHTML = item.type === 'movie' ? '🎬' : '📺';
                  }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>
                  {item.type === 'movie' ? '🎬' : '📺'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
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

  return (
    <Router>
      <div className="navbar">
        <Link
          to="/"
          className={`media-link ${ 'home' ? 'selected' : ''}`}
          onClick={() => ('home')}
        >
          <span className="nav-icon">🏠</span>
          Home
        </Link>
        <Link
          to="/movies"
          className={`media-link ${ 'movies' ? 'selected' : ''}`}
          onClick={() => ('movies')}
        >
          <span className="nav-icon">🎬</span>
          Movies
        </Link>
        <Link
          to="/tvshows"
          className={`media-link ${ 'tvShows' ? 'selected' : ''}`}
          onClick={() => ('tvShows')}
        >
          <span className="nav-icon">📺</span>
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
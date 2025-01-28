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

  return (
    <Router>
      <div className="navbar">
        <Link
          to="/"
          className={`media-link ${ 'home' ? 'selected' : ''}`}
          onClick={() => ('home')}
        >
          Home
        </Link>
        <Link
          to="/movies"
          className={`media-link ${ 'movies' ? 'selected' : ''}`}
          onClick={() => ('movies')}
        >
          Movies
        </Link>
        <Link
          to="/tvshows"
          className={`media-link ${ 'tvShows' ? 'selected' : ''}`}
          onClick={() => ('tvShows')}
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

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const API_KEY = 'c95b317e79468f9ab81e1b6511e28c0d';
const POPULAR_MOVIES_URL = 'https://api.themoviedb.org/3/movie/popular';
const TOP_WEEK_MOVIES_URL = 'https://api.themoviedb.org/3/movie/top_rated';
const TOP_MONTH_MOVIES_URL = 'https://api.themoviedb.org/3/discover/movie';
const SEARCH_MOVIES_URL = 'https://api.themoviedb.org/3/search/movie';

const MovieSearch = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = useCallback(async () => {
    try {
      let response;
      if (query) {
        response = await axios.get(`${SEARCH_MOVIES_URL}?api_key=${API_KEY}&query=${query}&page=${page}`);
      } else {
        switch (selectedCategory) {
          case 'all':
          case 'topWeek':
            response = await axios.get(`${TOP_WEEK_MOVIES_URL}?api_key=${API_KEY}&page=${page}`);
            break;
          case 'topMonth':
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            response = await axios.get(
              `${TOP_MONTH_MOVIES_URL}?api_key=${API_KEY}&primary_release_date.gte=${lastMonthDate.toISOString()}&page=${page}`
            );
            break;
          case 'newReleases':
            const today = new Date();
            response = await axios.get(
              `${TOP_MONTH_MOVIES_URL}?api_key=${API_KEY}&primary_release_date.gte=${today.toISOString()}&page=${page}`
            );
            break;
          default:
            response = await axios.get(`${POPULAR_MOVIES_URL}?api_key=${API_KEY}&page=${page}`);
        }
      }

      if (response.data.results && response.data.results.length > 0) {
        // Fetch movie details including runtime
        const moviesWithDetails = await Promise.all(response.data.results.map(async (movie) => {
            const movieDetailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`);
            const movieCreditsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`);
            const genres = movieDetailsResponse.data.genres || [];
            const director = movieCreditsResponse.data.crew.find((crewMember) => crewMember.job === 'Director');
            return {
                ...movie,
                genres,
                runtime: movieDetailsResponse.data.runtime,
                director: director ? director.name : 'Unknown',
            };
        }));

        if (page === 1) {
          setMovies(moviesWithDetails);
        } else {
          setMovies((prevMovies) => [...prevMovies, ...moviesWithDetails]);
        }
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  }, [query, page, selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchMovies();
      if (query !== '') {
        setPage(1);
        await fetchMovies();
      }
    };

    fetchData();
  }, [query, page, selectedCategory, fetchMovies]);

  const fetchMovieCast = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`
      );
      return response.data.cast;
    } catch (error) {
      console.error('Error fetching movie cast:', error);
      return [];
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const openModal = async (movie) => {
    try {
      // Fetch the cast for the selected movie
      const cast = await fetchMovieCast(movie.id);
  
      // Update the selected movie with cast details
      const updatedSelectedMovie = {
        ...movie,
        cast: cast
      };
  
      setSelectedMovie(updatedSelectedMovie);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie cast:', error);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  return (
    <div className="movie-list-container">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="movie-search-input"
        />
        <div className="category-buttons">
          <button
            className={`movie-search-button ${selectedCategory === 'all' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All
          </button>
          <button
            className={`movie-search-button ${selectedCategory === 'popular' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('popular')}
          >
            Popular
          </button>
          <button
            className={`movie-search-button ${selectedCategory === 'topWeek' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('topWeek')}
          >
            Top Week
          </button>
          <button
            className={`movie-search-button ${selectedCategory === 'topMonth' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('topMonth')}
          >
            Top Month
          </button>
          <button
            className={`movie-search-button ${selectedCategory === 'newReleases' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('newReleases')}
          >
            New Releases
          </button>
        </div>
      </div>
      
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => openModal(movie)}>
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-details">
              <h3>{movie.title}</h3>
              <p>Release Date: {movie.release_date}</p>
              <p>{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedMovie && (
        <div className="modal">
            <div className="modal-content">
            <span className="close" onClick={closeModal}>
                &times;
            </span>
            <h2>{selectedMovie.title}</h2>
            <div className="poster-container">
                <img
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                className="movie-poster"
            />
            </div>
            <p>Release Date: {selectedMovie.release_date}</p>
            <p>Overview: {selectedMovie.overview}</p>
            <p>Genres: {selectedMovie.genres && selectedMovie.genres.map(genre => genre.name).join(', ')}</p>
            <p>Runtime: {selectedMovie.runtime} minutes</p>
            <p>Director: {selectedMovie.director}</p>
            <h3>Cast:</h3>
            <ul>
                {selectedMovie.cast &&
                selectedMovie.cast.map((actor, index) => (
                    <p key={index}>{actor.name}</p>
                ))}
            </ul>
            </div>
        </div>
      )}

      {movies.length > 0 && (
        <button onClick={loadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default MovieSearch;
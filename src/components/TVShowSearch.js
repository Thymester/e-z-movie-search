import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const API_KEY = 'c95b317e79468f9ab81e1b6511e28c0d';
const POPULAR_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/popular';
const TOP_WEEK_TV_SHOWS_URL = 'https://api.themoviedb.org/3/tv/top_rated';
const TOP_MONTH_TV_SHOWS_URL = 'https://api.themoviedb.org/3/discover/tv';
const SEARCH_TV_SHOWS_URL = 'https://api.themoviedb.org/3/search/tv';

const TVShowSearch = () => {
  const [query, setQuery] = useState('');
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);

  const fetchTVShows = useCallback(async () => {
    try {
      let response;
      if (query) {
        response = await axios.get(`${SEARCH_TV_SHOWS_URL}?api_key=${API_KEY}&query=${query}&page=${page}`);
      } else {
        switch (selectedCategory) {
          case 'all':
          case 'popular':
            response = await axios.get(`${POPULAR_TV_SHOWS_URL}?api_key=${API_KEY}&page=${page}`);
            break;
          case 'topWeek':
            response = await axios.get(`${TOP_WEEK_TV_SHOWS_URL}?api_key=${API_KEY}&page=${page}`);
            break;
          case 'topMonth':
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            response = await axios.get(
              `${TOP_MONTH_TV_SHOWS_URL}?api_key=${API_KEY}&first_air_date.gte=${lastMonthDate.toISOString()}&page=${page}`
            );
            break;
          case 'newReleases':
            const today = new Date();
            response = await axios.get(
              `${TOP_MONTH_TV_SHOWS_URL}?api_key=${API_KEY}&first_air_date.gte=${today.toISOString()}&page=${page}`
            );
            break;
          default:
            response = await axios.get(`${POPULAR_TV_SHOWS_URL}?api_key=${API_KEY}&page=${page}`);
        }
      }

      if (response.data.results && response.data.results.length > 0) {
        const showsWithDetails = await Promise.all(response.data.results.map(async (show) => {
            const showDetailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${API_KEY}`);
            return {
                ...show,
                overview: showDetailsResponse.data.overview,
                genres: showDetailsResponse.data.genres || [],
                episodeRuntime: showDetailsResponse.data.episode_run_time,
            };
        }));

        if (page === 1) {
          setShows(showsWithDetails);
        } else {
          setShows((prevShows) => [...prevShows, ...showsWithDetails]);
        }
      } else {
        setShows([]);
      }
    } catch (error) {
      console.error('Error fetching TV shows:', error);
    }
  }, [query, page, selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchTVShows();
      if (query !== '') {
        setPage(1);
        await fetchTVShows();
      }
    };

    fetchData();
  }, [query, page, selectedCategory, fetchTVShows]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const openModal = async (show) => {
    try {
      const cast = await fetchShowCast(show.id);

      const updatedSelectedShow = {
        ...show,
        cast: cast
      };

      setSelectedShow(updatedSelectedShow);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching TV show cast:', error);
    }
  };

  const closeModal = () => {
    setSelectedShow(null);
    setIsModalOpen(false);
  };

  const fetchShowCast = async (showId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${API_KEY}`
      );
      return response.data.cast;
    } catch (error) {
      console.error('Error fetching TV show cast:', error);
      return [];
    }
  };

  return (
    <div className="movie-list-container">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search for a TV show..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="movie-search-input"
        />
        <div className="category-buttons">
          <button
            className={`tv-search-button ${selectedCategory === 'all' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All
          </button>
          <button
            className={`tv-search-button ${selectedCategory === 'popular' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('popular')}
          >
            Popular
          </button>
          <button
            className={`tv-search-button ${selectedCategory === 'topWeek' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('topWeek')}
          >
            Top Week
          </button>
          <button
            className={`tv-search-button ${selectedCategory === 'topMonth' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('topMonth')}
          >
            Top Month
          </button>
          <button
            className={`tv-search-button ${selectedCategory === 'newReleases' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('newReleases')}
          >
            New Releases
          </button>
        </div>
      </div>

      <div className="movie-list">
        {shows.map((show) => (
          <div key={show.id} className="movie-card" onClick={() => openModal(show)}>
            <img
              src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
              alt={show.name}
              className="movie-poster"
            />
            <div className="movie-details">
              <h3>{show.name}</h3>
              <p>First Air Date: {show.first_air_date}</p>
              <p>{show.overview}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedShow && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>{selectedShow.name}</h2>
            <div className="poster-container">
              <img
                src={`https://image.tmdb.org/t/p/w500${selectedShow.poster_path}`}
                alt={selectedShow.name}
                className="movie-poster"
              />
            </div>
            <p>First Air Date: {selectedShow.first_air_date}</p>
            <p>Overview: {selectedShow.overview}</p>
            <p>Genres: {selectedShow.genres && selectedShow.genres.map(genre => genre.name).join(', ')}</p>
            <p>Episode Runtime: {selectedShow.episodeRuntime && selectedShow.episodeRuntime.join(', ')} minutes</p>
            <h3>Cast:</h3>
            <ul>
              {selectedShow.cast &&
                selectedShow.cast.map((actor, index) => (
                  <li key={index}>{actor.name}</li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {shows.length > 0 && (
        <button onClick={loadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default TVShowSearch;
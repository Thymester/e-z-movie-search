import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_KEY = 'c95b317e79468f9ab81e1b6511e28c0d';

const TVShowSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tvShows, setTvShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`
        );
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch watch providers for a specific TV show
  const fetchWatchProviders = async (tvId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${API_KEY}`
      );
      return response.data.results?.US || null;
    } catch (error) {
      console.error('Error fetching watch providers:', error);
      return null;
    }
  };

  // Fetch providers for all TV shows
  const fetchProvidersForShows = async (showList) => {
    const showsWithProviderData = await Promise.all(
      showList.map(async (show) => {
        const providers = await fetchWatchProviders(show.id);
        return { ...show, watchProviders: providers };
      })
    );
    return showsWithProviderData;
  };

  const getApiUrl = (category, genreId, currentPage) => {
    const baseParams = `api_key=${API_KEY}&page=${currentPage}`;
    const genreParam = genreId ? `&with_genres=${genreId}` : '';
    
    if (searchTerm.trim()) {
      return `https://api.themoviedb.org/3/search/tv?${baseParams}&query=${encodeURIComponent(searchTerm)}`;
    }

    switch (category) {
      case 'new':
        // New episodes with genre filter
        return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=first_air_date.desc&first_air_date.gte=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}${genreParam}`;
      case 'week':
        // This week trending - if genre selected, use discover instead of trending
        if (genreId) {
          return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=popularity.desc&first_air_date.gte=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}${genreParam}`;
        }
        return `https://api.themoviedb.org/3/trending/tv/week?${baseParams}`;
      case 'month':
        // This month popular
        return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=popularity.desc&first_air_date.gte=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}${genreParam}`;
      case 'top':
        // Top rated with genre filter
        if (genreId) {
          return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=vote_average.desc&vote_count.gte=500${genreParam}`;
        }
        return `https://api.themoviedb.org/3/tv/top_rated?${baseParams}`;
      case 'popular':
        // Popular with genre filter
        if (genreId) {
          return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=popularity.desc${genreParam}`;
        }
        return `https://api.themoviedb.org/3/tv/popular?${baseParams}`;
      case '':
      default:
        // Show all - if genre selected, show all TV shows in that genre sorted by popularity
        if (genreId) {
          return `https://api.themoviedb.org/3/discover/tv?${baseParams}&sort_by=popularity.desc${genreParam}`;
        }
        return `https://api.themoviedb.org/3/tv/popular?${baseParams}`;
    }
  };

  const searchTVShows = useCallback(async (isNewSearch = false) => {
    setLoading(true);
    const currentPage = isNewSearch ? 1 : page;
    
    try {
      const url = getApiUrl(selectedCategory, selectedGenre, currentPage);
      const response = await axios.get(url);
      const showsWithImages = response.data.results.filter(show => show.poster_path);
      
      // Fetch providers for the shows
      const showsWithProviderData = await fetchProvidersForShows(showsWithImages);
      
      if (isNewSearch) {
        setTvShows(showsWithProviderData);
        setPage(2);
      } else {
        setTvShows(prev => [...prev, ...showsWithProviderData]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error searching TV shows:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGenre, page, searchTerm]);

  // Load popular shows by default and when category/genre changes
  useEffect(() => {
    searchTVShows(true);
  }, [selectedCategory, selectedGenre, searchTVShows]);

  // Handle search when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchTVShows(true);
      }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    } else if (!searchTerm) {
      searchTVShows(true);
    }
  }, [searchTerm, searchTVShows]);

  const handleShowClick = (show) => {
    setSelectedShow(show);
  };

  const closeModal = () => {
    setSelectedShow(null);
  };

  const handleSearch = () => {
    searchTVShows(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1);
  };

  const handleRemoveFilters = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setSearchTerm('');
    setPage(1);
  };

  const handleShowAll = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setSearchTerm('');
    setPage(1);
  };

  const loadMore = () => {
    searchTVShows(false);
  };

  // Generate search URLs for major streaming services
  const generateSearchUrl = (providerName, showTitle) => {
    const encodedTitle = encodeURIComponent(showTitle);
    const searchUrls = {
      'Netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
      'Amazon Prime Video': `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      'Disney Plus': `https://www.disneyplus.com/search?q=${encodedTitle}`,
      'Hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
      'HBO Max': `https://www.max.com/search?q=${encodedTitle}`,
      'Apple TV': `https://tv.apple.com/search?term=${encodedTitle}`,
      'Paramount Plus': `https://www.paramountplus.com/search/?query=${encodedTitle}`,
      'Peacock': `https://www.peacocktv.com/search/${encodedTitle}`,
      'Crunchyroll': `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      'YouTube': `https://www.youtube.com/results?search_query=${encodedTitle}+tv+show`,
      'Google Play Movies & TV': `https://play.google.com/store/search?q=${encodedTitle}&c=movies`,
      'Vudu': `https://www.vudu.com/content/movies/search/${encodedTitle}`,
      'Microsoft Store': `https://www.microsoft.com/en-us/search?q=${encodedTitle}`
    };
    return searchUrls[providerName] || null;
  };

  const renderStreamingLinks = (watchProviders, showTitle) => {
    if (!watchProviders) return null;

    const providers = [];
    
    // Add streaming services (flatrate)
    if (watchProviders.flatrate) {
      providers.push(...watchProviders.flatrate.map(p => ({ ...p, type: 'stream' })));
    }
    
    // Add rental options
    if (watchProviders.rent) {
      providers.push(...watchProviders.rent.slice(0, 3).map(p => ({ ...p, type: 'rent' })));
    }
    
    // Add purchase options
    if (watchProviders.buy) {
      providers.push(...watchProviders.buy.slice(0, 3).map(p => ({ ...p, type: 'buy' })));
    }

    if (providers.length === 0) return null;

    // Show max 6 providers to keep cards clean but show more options
    const limitedProviders = providers.slice(0, 6);

    return (
      <div style={{ 
        marginTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-muted)',
          fontWeight: '500'
        }}>
          📺 Available on:
        </span>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {limitedProviders.map(provider => {
            const searchUrl = generateSearchUrl(provider.provider_name, showTitle);
            const ProviderComponent = searchUrl ? 'a' : 'div';
            
            return (
              <ProviderComponent
                key={`${provider.provider_id}-${provider.type}`}
                href={searchUrl || undefined}
                target={searchUrl ? "_blank" : undefined}
                rel={searchUrl ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (searchUrl) {
                    e.stopPropagation(); // Prevent modal from opening
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--surface-light)',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: searchUrl ? 'pointer' : 'default',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                  minWidth: '60px',
                  position: 'relative'
                }}
                title={`${provider.provider_name} - ${provider.type === 'stream' ? 'Subscription' : provider.type === 'rent' ? 'Rent' : 'Buy'}${searchUrl ? ' (Click to search)' : ''}`}
                onMouseOver={(e) => {
                  if (searchUrl) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    e.target.style.borderColor = 'var(--primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (searchUrl) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '6px',
                    marginBottom: '0.25rem',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ 
                  fontSize: '0.65rem',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {provider.provider_name.replace(' Movies & TV', '').replace('Google Play', 'Play')}
                </span>
                <span style={{ 
                  fontSize: '0.6rem',
                  marginTop: '0.15rem',
                  opacity: 0.8
                }}>
                  {provider.type === 'stream' ? '📺' : provider.type === 'rent' ? '💰' : '🛒'}
                </span>
                {searchUrl && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: 'white'
                  }}>
                    ↗
                  </div>
                )}
              </ProviderComponent>
            );
          })}
          {watchProviders.link && (
            <a
              href={watchProviders.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevent modal from opening
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.5rem',
                fontSize: '0.7rem',
                color: 'var(--primary)',
                textDecoration: 'none',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid var(--primary)',
                minWidth: '60px',
                transition: 'var(--transition)'
              }}
              title="View all streaming options on TMDB"
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.25rem',
                fontSize: '16px',
                color: 'white'
              }}>
                +
              </div>
              <span style={{ fontSize: '0.65rem', textAlign: 'center' }}>More</span>
            </a>
          )}
        </div>
        <div style={{
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Data by JustWatch • Click logos to search on service
        </div>
      </div>
    );
  };

  return (
    <div className="movie-list-container">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search for TV shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="movie-search-input"
        />
        
        <div className="category-buttons">
          <button 
            className={`tv-search-button ${selectedCategory === 'new' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('new')}
          >
            🆕 New Episodes
          </button>
          
          <button 
            className={`tv-search-button ${selectedCategory === 'week' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('week')}
          >
            📅 This Week
          </button>
          
          <button 
            className={`tv-search-button ${selectedCategory === 'month' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('month')}
          >
            📆 This Month
          </button>
          
          <button 
            className={`tv-search-button ${selectedCategory === 'top' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('top')}
          >
            ⭐ Top Rated
          </button>
          
          <button 
            className={`tv-search-button ${selectedCategory === 'popular' ? 'selected' : ''}`}
            onClick={() => handleCategoryChange('popular')}
          >
            🔥 Popular
          </button>
          
          <button 
            className="tv-search-button"
            onClick={handleRemoveFilters}
            style={{
              backgroundColor: selectedGenre || searchTerm ? 'var(--accent)' : 'var(--surface)',
              color: selectedGenre || searchTerm ? 'white' : 'var(--text-secondary)'
            }}
          >
            🗑️ Remove Filters
          </button>
          
          <button 
            className="tv-search-button"
            onClick={handleShowAll}
          >
            📺 Show All
          </button>
          
          <select 
            value={selectedGenre} 
            onChange={(e) => handleGenreChange(e.target.value)}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedGenre ? 'var(--primary)' : 'var(--surface)',
              color: selectedGenre ? 'white' : 'var(--text-secondary)',
              border: selectedGenre ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <option value="">📺 All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="movie-list">
        {tvShows.map(show => (
          <div 
            key={show.id} 
            className="movie-card"
          >
            <div onClick={() => handleShowClick(show)} style={{ cursor: 'pointer' }}>
              <img 
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={show.name}
              />
              <div className="movie-details">
                <h3>{show.name}</h3>
                <p>First Air Date: {show.first_air_date}</p>
                <p>Rating: {show.vote_average}/10</p>
                <p>{show.overview?.substring(0, 150)}...</p>
              </div>
            </div>
            
            {/* Streaming services links on the card - separate from clickable area */}
            {renderStreamingLinks(show.watchProviders, show.name)}
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: 'var(--text-secondary)'
        }}>
          Loading TV shows and streaming info...
        </div>
      )}

      {tvShows.length > 0 && !loading && (
        <button 
          className="load-more-button"
          onClick={loadMore}
        >
          Load More
        </button>
      )}

      {selectedShow && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={closeModal}>×</button>
            
            <div className="poster-container">
              <img 
                src={`https://image.tmdb.org/t/p/w500${selectedShow.poster_path}`}
                alt={selectedShow.name}
              />
            </div>
            
            <h2>{selectedShow.name}</h2>
            <p><strong>First Air Date:</strong> {selectedShow.first_air_date}</p>
            <p><strong>Rating:</strong> {selectedShow.vote_average}/10</p>
            <p><strong>Overview:</strong> {selectedShow.overview}</p>
            
            {selectedShow.watchProviders && selectedShow.watchProviders.link && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a 
                  href={selectedShow.watchProviders.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)'
                  }}
                >
                  📺 View All Streaming Options
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TVShowSearch;
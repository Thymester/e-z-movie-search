import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_KEY = 'c95b317e79468f9ab81e1b6511e28c0d';

const TVShowSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tvShows, setTvShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const ITEMS_PER_PAGE = 50;

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
  const fetchWatchProviders = useCallback(async (tvId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${tvId}/watch/providers?api_key=${API_KEY}`
      );
      return response.data.results?.US || null;
    } catch (error) {
      console.error('Error fetching watch providers:', error);
      return null;
    }
  }, []);

  // Fetch providers for all TV shows
  const fetchProvidersForShows = useCallback(async (showList) => {
    const showsWithProviderData = await Promise.all(
      showList.map(async (show) => {
        const providers = await fetchWatchProviders(show.id);
        return { ...show, watchProviders: providers };
      })
    );
    return showsWithProviderData;
  }, [fetchWatchProviders]);

  const getApiUrl = useCallback((category, genreId, page) => {
    const baseParams = `api_key=${API_KEY}&page=${page}`;
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
  }, [searchTerm]);

  const searchTVShows = useCallback(async (page = 1) => {
    setLoading(true);
    
    try {
      // We need to fetch multiple pages to get 50 items since TMDB returns 20 per page
      const pagesToFetch = Math.ceil(ITEMS_PER_PAGE / 20); // 3 pages to get 50+ items
      const startPage = (page - 1) * pagesToFetch + 1;
      
      const requests = [];
      for (let i = 0; i < pagesToFetch; i++) {
        const apiPage = startPage + i;
        const url = getApiUrl(selectedCategory, selectedGenre, apiPage);
        requests.push(axios.get(url));
      }
      
      const responses = await Promise.all(requests);
      
      // Combine results from all pages
      let allShows = [];
      let totalResults = 0;
      
      responses.forEach(response => {
        const showsWithImages = response.data.results.filter(show => show.poster_path);
        allShows = [...allShows, ...showsWithImages];
        totalResults = response.data.total_results;
      });
      
      // Take only 50 items
      const limitedShows = allShows.slice(0, ITEMS_PER_PAGE);
      
      // Fetch providers for the shows
      const showsWithProviderData = await fetchProvidersForShows(limitedShows);
      
      setTvShows(showsWithProviderData);
      
      // Calculate total pages based on 50 items per page
      const calculatedTotalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
      setTotalPages(Math.min(calculatedTotalPages, 500)); // Limit to 500 pages for performance
      
    } catch (error) {
      console.error('Error searching TV shows:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGenre, getApiUrl, fetchProvidersForShows]);

  // Load shows when page, category, or genre changes
  useEffect(() => {
    searchTVShows(currentPage);
  }, [selectedCategory, selectedGenre, currentPage, searchTVShows]);

  // Handle search when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        searchTVShows(1);
      }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    } else if (!searchTerm) {
      setCurrentPage(1);
      searchTVShows(1);
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
    setCurrentPage(1);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setCurrentPage(1);
  };

  const handleRemoveFilters = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Pagination Controls */}
      {!loading && tvShows.length > 0 && totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          margin: '2rem 0',
          flexWrap: 'wrap'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentPage === 1 ? 'var(--surface)' : 'var(--primary)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              transition: 'var(--transition)'
            }}
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  1
                </button>
                <span style={{ color: 'var(--text-muted)' }}>...</span>
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
              if (pageNum === currentPage) {
                return (
                  <button
                    key={pageNum}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--primary)',
                      color: 'white',
                      border: '1px solid var(--primary)',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'var(--surface-light)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'var(--surface)';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentPage === totalPages ? 'var(--surface)' : 'var(--primary)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              transition: 'var(--transition)'
            }}
          >
            Next →
          </button>

          {/* Page Info */}
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginLeft: '1rem'
          }}>
            Page {currentPage} of {totalPages}
          </div>
        </div>
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
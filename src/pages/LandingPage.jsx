import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoginPlease from '../components/loginPlease';
import Snackbar from '../components/Snackbar';
import LogoutConfirmation from '../components/LogoutConfirmation';
import './index.css'; // or './App.css'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const LandingPage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isNowPlayingLoading, setIsNowPlayingLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  
  // Remove trendingFilter state
  const [nowPlayingFilter, setNowPlayingFilter] = useState('all');
  const [upcomingFilter, setUpcomingFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    fetchTrendingMovies();
    fetchNowPlayingMovies();
    fetchUpcomingMovies();
    setIsLoggedIn(checkLoginStatus());
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear(); // Clear all localStorage items
    setIsLoggedIn(false);
    setShowLogoutConfirmation(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const fetchTrendingMovies = async () => {
    try {
      setIsTrendingLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/day`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params: {
          language: 'hi', // Change to Hindi to get more Indian content
          page: 1,
          region: 'IN'
        }
      });
      setTrendingMovies(response.data.results.slice(0, 20));
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  const fetchNowPlayingMovies = async () => {
    try {
      setIsNowPlayingLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params: {
          language: 'en-US',
          page: 1,
          region: 'IN' // Add region parameter for Indian movies
        }
      });
      setNowPlayingMovies(response.data.results.slice(0, 20));
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
    } finally {
      setIsNowPlayingLoading(false);
    }
  };

  const fetchUpcomingMovies = async () => {
    try {
      setIsUpcomingLoading(true);
      const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params: {
          language: 'en-US',
          page: 1,
          region: 'IN' // Add region parameter for Indian movies
        }
      });
      setUpcomingMovies(response.data.results.slice(0, 20));
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
    } finally {
      setIsUpcomingLoading(false);
    }
  };

  const handleBookmark = async (movieId, tmdbId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        setShowLoginPopup(true);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/addmoviebookmark/movie`,
        { userId, movieId, tmdbId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        setSnackbar({
          show: true,
          message: 'Movie bookmarked successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error bookmarking movie:', error);
      
      // Handle specific error messages from the server
      const errorMessage = error.response?.data?.error || 'Failed to bookmark movie';
      
      setSnackbar({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, show: false }));
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setIsSearching(false);
      fetchTrendingMovies();
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params: {
          query: query,
          language: 'en-US',
          page: 1
        }
      });

      if (response.data.results.length > 0) {
        setTrendingMovies(response.data.results.slice(0, 20));
      } else {
        alert("No movies found!");
        setIsSearching(false);
        fetchTrendingMovies();
      }
    } catch (error) {
      console.error('Error searching:', error);
      setIsSearching(false);
      fetchTrendingMovies();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setIsSearching(false);
    fetchTrendingMovies();
  };

  const filterMovies = (movies, filter) => {
    if (filter === 'all') return movies;
    return movies.filter(movie => {
      if (filter === 'indian') {
        return movie.original_language === 'hi' || movie.original_language === 'ta' || 
               movie.original_language === 'te' || movie.original_language === 'ml' || 
               movie.original_language === 'bn' || movie.original_language === 'kn';
      }
      return movie.original_language !== 'hi' && movie.original_language !== 'ta' && 
             movie.original_language !== 'te' && movie.original_language !== 'ml' && 
             movie.original_language !== 'bn' && movie.original_language !== 'kn';
    });
  };

  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderMovieGrid = (movies, filter) => {
    const filteredMovies = filterMovies(movies, filter);
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMovies.map(movie => {
          const movieTitle = movie.title;
          const date = movie.release_date;
          const overviewWords = movie.overview ? movie.overview.split(' ') : [];
          const truncatedOverview = overviewWords.length > 10
            ? overviewWords.slice(0, 10).join(' ') + '...'
            : movie.overview || '';

          return (
            <div key={movie.id} className="p-2 rounded-lg shadow-md relative">
              <div style={{ position: 'relative', paddingBottom: '100%' }}>
                <Link to={`/DetailInfoPage/${movie.id}?type=movie`}>
                  <img 
                    src={`${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`} 
                    alt={movieTitle} 
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" 
                  />
                </Link>
                <div className="absolute top-0 right-0 m-2">
                  <button 
                    onClick={() => handleBookmark(movie.id, movie.id)} 
                    className="text-white bg-gray-800 rounded-full p-1 hover:bg-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">{movieTitle}</h3>
                <p className="text-sm text-gray-600 text-white ml-2">{new Date(date).getFullYear()}</p>
              </div>
              <p className="text-sm mt-2 text-white hidden lg:block">{truncatedOverview}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilterButtons = (currentFilter, setFilter) => (
    <div className="flex flex-wrap gap-2 sm:gap-4">
      <button
        onClick={() => setFilter('all')}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${
          currentFilter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All Movies
      </button>
      <button
        onClick={() => setFilter('indian')}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${
          currentFilter === 'indian'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Indian Movies
      </button>
      <button
        onClick={() => setFilter('international')}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${
          currentFilter === 'international'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        International Movies
      </button>
    </div>
  );

  const renderSectionHeader = (title, currentFilter, setFilter, showFilters = true) => (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {showFilters && renderFilterButtons(currentFilter, setFilter)}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row lg:flex-row bg-slate-900 min-h-screen">
      {showLoginPopup && <LoginPlease onClose={() => setShowLoginPopup(false)} />}
      {showLogoutConfirmation && (
        <LogoutConfirmation
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
        />
      )}
      
      <nav className="fixed top-0 left-0 w-full sm:w-auto bg-gray-800 p-2 sm:p-4 lg:w-34 md:w-34 lg:h-[calc(100vh-40px)] lg:flex lg:flex-col lg:ml-10 lg:mt-5 lg:mr-10 md:ml-5 md:mt-5 md:mr-10 rounded-xl z-50 mb-16 sm:mb-0">
        <div className="text-white text-xl font-bold mb-2 sm:mb-4 lg:mb-0 flex justify-center items-center">
          MoviTV
        </div>
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:flex-col lg:items-center md:justify-start">
          <Link to="/" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="home.gif" alt="home" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Home</p>
          </Link>
          <Link to="/MoviesPage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="movie.gif" alt="movies" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Movies</p>
          </Link>
          <Link to="/TVSeriesPage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="tv.gif" alt="tv series" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">TVSeries</p>
          </Link>
          <Link to="/BookmarkPage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="bookmark.gif" alt="bookmark" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Bookmark</p>
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/ProfilePage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="profile.gif" alt="profile" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Profile</p>
              </Link>
              <button onClick={handleLogout} className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="logout.gif" alt="logout" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">Logout</p>
              </button>
            </>
          ) : (
            <>
              <Link to="/LoginPage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="login.gif" alt="logout" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">LogIn</p>
              </Link>
              <Link to="/RegisterPage" className="text-white px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="signin.gif" alt="logout" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm">SignIn</p>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 w-full sm:w-auto md:w-1/2 lg:w-1/2 lg:ml-[200px] md:ml-[120px] mt-24 sm:mt-0">
        <div className="p-4 pt-10">
          <div className="container mx-auto flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full p-2 pr-12 border border-gray-300 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              {isSearching ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <img 
                    src="/searchIcon.gif" 
                    alt="search" 
                    className="w-8 h-8"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trending/Search Results Section */}
        <section className="p-8">
          <div className="container mx-auto">
            {renderSectionHeader(
              isSearching ? `Search Results` : 'Trending',
              null,
              null,
              false
            )}
            {isTrendingLoading ? (
              renderLoadingSpinner()
            ) : (
              <div className="flex overflow-x-auto space-x-4 hide-scrollbar">
                {trendingMovies.map(movie => {
                  const movieTitle = movie.title;
                  return (
                    <div key={movie.id} className="relative flex-shrink-0 w-96 hover:bg-gray-700 transition-colors duration-300 rounded-lg">
                      <Link to={`/DetailInfoPage/${movie.id}?type=movie`}>
                        <img 
                          src={`${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`} 
                          alt={movieTitle} 
                          className="w-full h-56 object-cover rounded-lg hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent rounded-b-lg">
                          <h3 className="text-lg font-bold text-white">{movieTitle}</h3>
                          <p className="text-sm text-white">{new Date(movie.release_date).getFullYear()}</p>
                          <p className="text-sm text-white">{movie.original_language.toUpperCase()}</p>
                        </div>
                      </Link>
                      <div className="absolute top-0 right-0 m-2">
                        <button 
                          onClick={() => handleBookmark(movie.id, movie.id)} 
                          className="text-white bg-gray-800 rounded-full p-1 hover:bg-gray-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Now Playing Section */}
        <section className="p-8">
          <div className="container mx-auto">
            {renderSectionHeader('Now in Theatres', nowPlayingFilter, setNowPlayingFilter)}
            {isNowPlayingLoading ? (
              renderLoadingSpinner()
            ) : (
              renderMovieGrid(nowPlayingMovies, nowPlayingFilter)
            )}
          </div>
        </section>

        {/* Upcoming Movies Section */}
        <section className="p-8">
          <div className="container mx-auto">
            {renderSectionHeader('Upcoming Movies', upcomingFilter, setUpcomingFilter)}
            {isUpcomingLoading ? (
              renderLoadingSpinner()
            ) : (
              renderMovieGrid(upcomingMovies, upcomingFilter)
            )}
          </div>
        </section>
      </div>

      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleSnackbarClose}
        />
      )}
    </div>
  );
};

export default LandingPage;

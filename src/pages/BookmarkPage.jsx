import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Snackbar from '../components/Snackbar';
import LoginPlease from '../components/loginPlease';
import LogoutConfirmation from '../components/LogoutConfirmation';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const BookmarkPage = () => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [bookmarkedTVSeries, setBookmarkedTVSeries] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
    if (checkLoginStatus()) {
      fetchBookmarkedData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchTMDBData = async (tmdbId, type) => {
    try {
      if(!tmdbId) {
        console.log("tmdbId is not found");
        return null;
      }
      const endpoint = type === 'movie' 
        ? `${TMDB_BASE_URL}/movie/${tmdbId}`
        : `${TMDB_BASE_URL}/tv/${tmdbId}`;
      
      const response = await axios.get(endpoint, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching TMDB data:', error);
      return null;
    }
  };

  const fetchBookmarkedData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const moviesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/showmoviebookmarks/movies/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tvSeriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/showbookmarks/tvseries/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch TMDB data for each bookmarked item
      const moviesWithTMDBData = await Promise.all(
        moviesResponse.data.map(async (bookmark) => {
          // Access tmdbId from the correct path in the response
          const tmdbId = bookmark.movieId || bookmark.tmdbId;
          const tmdbData = await fetchTMDBData(tmdbId, 'movie');
          return { ...bookmark, tmdbData };
        })
      );

      const tvSeriesWithTMDBData = await Promise.all(
        tvSeriesResponse.data.map(async (bookmark) => {
          // Access tmdbId from the correct path in the response
          const tmdbId = bookmark.tvSeriesId || bookmark.tmdbId;
          const tmdbData = await fetchTMDBData(tmdbId, 'tv');
          return { ...bookmark, tmdbData };
        })
      );

      setBookmarkedMovies(moviesWithTMDBData);
      setBookmarkedTVSeries(tvSeriesWithTMDBData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarked data:', error);
      setIsLoading(false);
    }
  };

  const handleItemClick = (item, type) => {
    if (item.tmdbData) {
      navigate(`/DetailInfoPage/${item.tmdbData.id}?type=${type}`);
    }
  };

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

  const removeBookmark = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setSnackbar({
          show: true,
          message: 'Please login to remove bookmarks',
          type: 'error'
        });
        return;
      }

      const endpoint = type === 'movie' 
        ? `${import.meta.env.VITE_API_URL}/api/deletemoviebookmark/movie/${userId}/${id}` 
        : `${import.meta.env.VITE_API_URL}/api/deletebookmark/tvseries/${userId}/${id}`;
  
      const response = await axios.delete(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        // Update the state to remove the bookmark
        if (type === 'movie') {
          setBookmarkedMovies(bookmarkedMovies.filter(movie => movie._id !== id));
        } else {
          setBookmarkedTVSeries(bookmarkedTVSeries.filter(tvSeries => tvSeries._id !== id));
        }

        setSnackbar({
          show: true,
          message: `${type === 'movie' ? 'Movie' : 'TV Series'} bookmark removed successfully`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      
      // Handle specific error messages from the server
      const errorMessage = error.response?.data?.error || `Failed to remove ${type === 'movie' ? 'movie' : 'TV series'} bookmark`;
      
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

  const truncateOverview = (overview) => {
    const words = overview.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return overview;
  };

  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderNoBookmarks = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <img src="/no_toshow.gif" alt="No bookmarks" className="w-48 h-48 mb-4" />
      <p className="text-xl text-gray-400">No bookmarks available</p>
    </div>
  );

  const renderLoginMessage = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <img src="/no_toshow.gif" alt="Login required" className="w-48 h-48 mb-4" />
      <p className="text-xl text-gray-400">Please login to view your bookmarks</p>
      <Link to="/LoginPage" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Login Now
      </Link>
    </div>
  );

  const handleSearch = () => {
    if (query.trim()) {
      setIsSearching(true);
      // Filter movies
      const filteredMovies = bookmarkedMovies.filter(movie => 
        movie.tmdbData?.title?.toLowerCase().includes(query.toLowerCase())
      );
      // Filter TV series
      const filteredTVSeries = bookmarkedTVSeries.filter(tv => 
        tv.tmdbData?.name?.toLowerCase().includes(query.toLowerCase())
      );
      
      setBookmarkedMovies(filteredMovies);
      setBookmarkedTVSeries(filteredTVSeries);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setIsSearching(false);
    fetchBookmarkedData(); // Reset to original data
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row lg:flex-row bg-slate-900 min-h-screen">
        <nav className="fixed top-0 left-0 bg-gray-800 p-2 sm:p-4 lg:w-34 lg:h-[calc(100vh-40px)] lg:flex lg:flex-col lg:ml-10 lg:mt-5 lg:mr-10 rounded-xl z-50">
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

        <div className="flex-1 md:w-1/2 lg:w-1/2 lg:ml-[200px]">
          {renderLoadingSpinner()}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col md:flex-row lg:flex-row bg-slate-900 min-h-screen">
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
          {renderLoginMessage()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row lg:flex-row bg-slate-900 min-h-screen">
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

      <div className="flex-1 w-full sm:w-auto md:w-1/2 lg:w-1/2 lg:ml-[200px] md:ml-[120px] mt-24 sm:mt-0">">
        <div className="p-8">
          <div className="container mx-auto flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search bookmarks..."
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

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Bookmarked Movies</h2>
            {bookmarkedMovies.length === 0 ? (
              renderNoBookmarks()
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bookmarkedMovies.map(bookmark => (
                  <div key={bookmark._id} className="p-2 rounded-lg shadow-md bg-gray-800">
                    {bookmark.tmdbData && (
                      <div 
                        onClick={() => handleItemClick(bookmark, 'movie')}
                        className="cursor-pointer"
                      >
                        <div className="relative" style={{ paddingBottom: '100%' }}>
                          {bookmark.tmdbData.poster_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w500${bookmark.tmdbData.poster_path}`} 
                              alt={bookmark.tmdbData.title} 
                              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" 
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">
                            {bookmark.tmdbData.title}
                          </h3>
                          <p className="text-sm text-gray-400 text-white ml-2">
                            {new Date(bookmark.tmdbData.release_date).getFullYear()}
                          </p>
                        </div>
                        <p className="text-sm mt-2 text-white hidden lg:block">
                          {truncateOverview(bookmark.tmdbData.overview)}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removeBookmark(bookmark._id, 'movie')}
                      className="md:mt-4 mt-2 px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Bookmarked TV Series</h2>
            {bookmarkedTVSeries.length === 0 ? (
              renderNoBookmarks()
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bookmarkedTVSeries.map(bookmark => (
                  <div key={bookmark._id} className="p-2 rounded-lg shadow-md bg-gray-800">
                    {bookmark.tmdbData && (
                      <div 
                        onClick={() => handleItemClick(bookmark, 'tv')}
                        className="cursor-pointer"
                      >
                        <div className="relative" style={{ paddingBottom: '100%' }}>
                          {bookmark.tmdbData.poster_path && (
                            <img 
                              src={`https://image.tmdb.org/t/p/w500${bookmark.tmdbData.poster_path}`} 
                              alt={bookmark.tmdbData.name} 
                              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" 
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white">
                            {bookmark.tmdbData.name}
                          </h3>
                          <p className="text-sm text-gray-400 text-white ml-2">
                            {new Date(bookmark.tmdbData.first_air_date).getFullYear()}
                          </p>
                        </div>
                        <p className="text-sm mt-2 text-white hidden lg:block">
                          {truncateOverview(bookmark.tmdbData.overview)}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removeBookmark(bookmark._id, 'tvSeries')}
                      className="md:mt-4 mt-2 px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
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

export default BookmarkPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoginPlease from '../components/loginPlease';
import Snackbar from '../components/Snackbar';
import LogoutConfirmation from '../components/LogoutConfirmation';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    fetchGenres();
    setIsLoggedIn(checkLoginStatus());
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, selectedGenres, selectedYear, selectedLanguage, sortBy]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        sort_by: sortBy,
        ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(',') }),
        ...(selectedYear && { primary_release_year: selectedYear }),
        ...(selectedLanguage && { with_original_language: selectedLanguage })
      };

      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params
      });
      
      setMovies(response.data.results);
      setTotalPages(Math.min(response.data.total_pages, 500)); // TMDB limits to 500 pages
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
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

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchMovies();
      return;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        params: {
          query: query,
          page: currentPage
        }
      });

      if (response.data.results.length > 0) {
        setMovies(response.data.results);
        setTotalPages(Math.min(response.data.total_pages, 500));
      } else {
        console.log('No movies found');
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, show: false }));
  };

  const renderFilters = () => (
    <div className="bg-gray-800 p-4 rounded-lg mb-6 mt-10">
      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Year Filter */}
        <div className="w-full">
          <label className="block text-white mb-2">Release Year</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          >
            <option value="">All Years</option>
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div className="w-full">
          <label className="block text-white mb-2">Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="w-full">
          <label className="block text-white mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          >
            <option value="popularity.desc">Popularity</option>
            <option value="release_date.desc">Release Date</option>
            <option value="vote_average.desc">Rating</option>
            <option value="revenue.desc">Revenue</option>
          </select>
        </div>
      </div>

      {/* Genres Section */}
      <div className="w-full">
        <label className="block text-white mb-2">Genres</label>
        <div className="relative w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxWidth: '100%' }}>
            <div className="flex space-x-2 px-1 min-w-min pb-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
          {/* Gradient Overlays for Scroll Indication */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-8 mb-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md ${
          currentPage === 1
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Previous
      </button>
      <span className="text-white">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Next
      </button>
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
        {/* Search Bar */}
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
              {query ? (
                <button
                  onClick={() => {
                    setQuery('');
                    fetchMovies();
                  }}
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

        {/* Filters */}
        <div className="container mx-auto px-4">
          {renderFilters()}
        </div>

        {/* Movies */}
        <section className="pt-4 pb-4">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Movies</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                  {movies.map(movie => {
                    const movieTitle = movie.title;
                    const date = movie.release_date;
                    const overviewWords = movie.overview.split(' ');
                    const truncatedOverview = overviewWords.length > 10
                      ? overviewWords.slice(0, 10).join(' ') + '...'
                      : movie.overview;

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
                              onClick={() => handleBookmark(movie.id, movie.tmdbId)} 
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
                {renderPagination()}
              </>
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

export default MoviesPage;

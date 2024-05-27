import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './index.css'; // or './App.css'

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const LandingPage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchTrendingMovies();
    fetchRecommendedMovies();
    setIsLoggedIn(checkLoginStatus());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
  };

  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get('https://movitv-backend.onrender.com/api/trendingmovies');
      setTrendingMovies(response.data);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };

  const fetchRecommendedMovies = async () => {
    try {
      const response = await axios.get('https://movitv-backend.onrender.com/api/recommend');
      setRecommendedMovies(response.data);
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
    }
  };

  const handleBookmark = async (movieId, tmdbId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token) {
        alert('Please log in to bookmark movies.');
        return;
      }

      await axios.post(
        'https://movitv-backend.onrender.com/api/addmoviebookmark/movie',
        { userId, movieId, tmdbId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(' bookmarked successfully!');
    } catch (error) {
      console.error('Error bookmarking movie:', error);
      alert('] bookmarked successfully!');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://movitv-backend.onrender.com/api/search?query=${query}`);
      console.log('Search response:', response.data); // Log response data for debugging

      // Check if the response contains any movie objects
      if (response.data.length > 0) {
        const newMovie = response.data[0]; // Access the movie object at index 0
        if (newMovie && newMovie._id) {
          setRecommendedMovies((prevMovies) => {
            // Check if the movie is already in the recommendedMovies array
            const filteredMovies = prevMovies.filter(movie => movie._id !== newMovie._id);

            // Add the new movie at the 0th position
            return [newMovie, ...filteredMovies];
          });
        } else {
          console.error('Error: Invalid movie object received');
        }
      } else {
        console.error('Error: No movie objects found in response');
        alert("not fould in database!")
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

  return (
    <div className="flex flex-col md:flex-row lg:flex-row bg-slate-900 min-h-screen">
      <nav className="bg-gray-800 p-4 lg:w-34 lg:h-screen lg:flex lg:flex-col lg:ml-10 lg:mt-5 lg:mr-10 rounded-xl">
        <div className="text-white text-xl font-bold mb-4 lg:mb-0 flex justify-center items-center">
          MoviTV
        </div>
        <div className="flex md:flex-col lg:items-center">
          <Link to="/" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center md:mt-10">
            <img src="home.gif" alt="home" className="h-6 w-6 md:h-8 md:w-8" />
            <p className="mt-2 hidden md:block lg:block">Home</p>
          </Link>
          <Link to="/MoviesPage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="movie.gif" alt="movies" className="h-6 w-6 md:h-8 md:w-8" />
            <p className="mt-2 hidden md:block lg:block">Movies</p>
          </Link>
          <Link to="/TVSeriesPage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="tv.gif" alt="tv series" className="h-6 w-6 md:h-8 md:w-8" />
            <p className="mt-2 hidden md:block lg:block">TVSeries</p>
          </Link>
          <Link to="/BookmarkPage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center">
            <img src="bookmark.gif" alt="bookmark" className="h-6 w-6 md:h-8 md:w-8" />
            <p className="mt-2 hidden md:block lg:block">Bookmark</p>
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/ProfilePage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="profile.gif" alt="profile" className="h-6 w-6 md:h-8 md:w-8" />
                <p className="mt-2 hidden md:block lg:block">Profile</p>
              </Link>
              <button onClick={handleLogout} className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center">
                <img src="logout.gif" alt="logout" className="h-6 w-6 md:h-8 md:w-8" />
                <p className="mt-2 hidden md:block lg:block">Logout</p>
              </button>
            </>
          ) : (
            <>
              <Link to="/LoginPage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center ">
                <img src="login.gif" alt="logout" className="h-6 w-6 md:h-8 md:w-8" />
                <p className="mt-2 hidden md:block lg:block">LogIn</p>
              </Link>
              <Link to="/RegisterPage" className="text-white px-3 py-2 rounded-md text-sm font-medium flex flex-col items-center ">
                <img src="signin.gif" alt="logout" className="h-6 w-6 md:h-8 md:w-8" />
                <p className="mt-2 hidden md:block lg:block">SignIn</p>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 md:w-1/2 lg:w-1/2">
        <div className="p-4">
          <div className="container mx-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Trending</h2>
            <div className="flex overflow-x-auto space-x-4 hide-scrollbar">
              {trendingMovies.map(movie => {
                const movieTitle = movie.title || movie.name;
                return (
                  <div key={movie._id} className="relative flex-shrink-0 w-96 hover:bg-gray-700 transition-colors duration-300 rounded-lg">
                    <Link to={`/DetailInfoPage/${movie._id}?tmdbId=${movie.id}&type=${movie.type}`}>
                      <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movieTitle} className="w-full h-56 object-cover rounded-lg hover:scale-105 transition-transform duration-300" />
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent rounded-b-lg">
                        <h3 className="text-lg font-bold text-white">{movieTitle}</h3>
                        <p className="text-sm text-white">{new Date(movie.release_date).getFullYear()}</p>
                        <p className="text-sm text-white">{movie.original_language.toUpperCase()}</p>
                      </div>
                    </Link>
                    <div className="absolute top-0 right-0 m-2">
                      <button onClick={() => handleBookmark(movie._id, movie.id)} className="text-white bg-gray-800 rounded-full p-1 hover:bg-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedMovies.map(movie => {
                const movieTitle = movie.title || movie.name;
                const date = movie.release_date || movie.first_air_date;
                const overviewWords = movie.overview ? movie.overview.split(' ') : [];
                const truncatedOverview = overviewWords.length > 10
                  ? overviewWords.slice(0, 10).join(' ') + '...'
                  : movie.overview || '';

                return (
                  <div key={movie._id} className="p-2 rounded-lg shadow-md relative">
                    <div style={{ position: 'relative', paddingBottom: '100%' }}>
                      <Link to={`/DetailInfoPage/${movie._id}?tmdbId=${movie.id}&type=${movie.type}`}>
                        <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movieTitle} className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="absolute top-0 right-0 m-2">
                        <button onClick={() => handleBookmark(movie._id, movie.id)} className="text-white bg-gray-800 rounded-full p-1 hover:bg-gray-600">
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

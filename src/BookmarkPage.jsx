import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BookmarkPage = () => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [bookmarkedTVSeries, setBookmarkedTVSeries] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    fetchBookmarkedData();
    setIsLoggedIn(checkLoginStatus());
  }, []);

  const fetchBookmarkedData = async () => {
    try {
      const userId = localStorage.getItem('userId');

      const moviesResponse = await fetch(`https://movitv-backend.onrender.com/api/showmoviebookmarks/movies/${userId}`);
      if (!moviesResponse.ok) {
        throw new Error('Failed to fetch bookmarked movies');
      }
      const moviesData = await moviesResponse.json();
      setBookmarkedMovies(moviesData);

      const tvSeriesResponse = await fetch(`https://movitv-backend.onrender.com/api/showbookmarks/tvseries/${userId}`);
      if (!tvSeriesResponse.ok) {
        throw new Error('Failed to fetch bookmarked TV series');
      }
      const tvSeriesData = await tvSeriesResponse.json();
      setBookmarkedTVSeries(tvSeriesData);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarked data:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
  };

  const removeBookmark = async (id,type) => {
    try {
      const endpoint = type === 'movie' 
        ? `https://movitv-backend.onrender.com/api/deletemoviebookmark/movie/${id}` 
        : `https://movitv-backend.onrender.com/api/deletebookmark/tvseries/${id}`;
  
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
  
      if (type === 'movie') {
        setBookmarkedMovies(bookmarkedMovies.filter(movie => movie._id !== id));
      } else {
        setBookmarkedTVSeries(bookmarkedTVSeries.filter(tvSeries => tvSeries._id !== id));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const truncateOverview = (overview) => {
    const words = overview.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return overview;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

      <div className="flex-1">
        <div className="p-4">
          <div className="container mx-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Bookmarked Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bookmarkedMovies.map(product => (
                <div key={product._id} className="p-2 rounded-lg shadow-md bg-gray-800">
                  {product.movie && (
                    <Link to={`/DetailInfoPage/${product.movie._id}?tmdbId=${product.movieId}&type=movie`}>
                      <div className="relative" style={{ paddingBottom: '100%' }}>
                        {product.movie.backdrop_path && (
                          <img src={`https://image.tmdb.org/t/p/w500${product.movie.backdrop_path}`} alt={product.movie.title} className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" />
                        )}
                      </div>
                    </Link>
                  )}
                  <div className="flex items-center justify-between">
                    {product.movie && (
                      <>
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">{product.movie.title}</h3>
                        <p className="text-sm text-gray-400 text-white ml-2">{new Date(product.movie.release_date).getFullYear()}</p>
                      </>
                    )}
                  </div>
                  {product.movie && (
                    <p className="text-sm mt-2 text-white hidden lg:block">{truncateOverview(product.movie.overview)}</p>
                  )}
                  <button
                    onClick={() => removeBookmark(product._id,'movie')}
                    className="md:mt-4 mt-2 px-2 py-2 bg-red-600 text-white rounded-md"
                  >
                    {/* <img src="delete.gif" alt="delete" className="h-6 w-6 md:h-8 md:w-8" /> */}
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-8">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Bookmarked TV Series</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bookmarkedTVSeries.map(product => (
                <div key={product._id} className="p-2 rounded-lg shadow-md bg-gray-800">
                  {product.tvSeries && (
                    <Link to={`/DetailInfoPage/${product.tvSeries._id}?tmdbId=${product.tvSeriesId}&type=tvseries`}>
                      <div className="relative" style={{ paddingBottom: '100%' }}>
                        {product.tvSeries.backdrop_path && (
                          <img src={`https://image.tmdb.org/t/p/w500${product.tvSeries.backdrop_path}`} alt={product.tvSeries.name} className="absolute top-0 left-0 w-full h-full object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300" />
                        )}
                      </div>
                    </Link>
                  )}
                  <div className="flex items-center justify-between">
                    {product.tvSeries && (
                      <>
                        <h3 className="text-lg font-bold text-white">{product.tvSeries.name}</h3>
                        <p className="text-sm text-gray-400 text-white ml-2">{new Date(product.tvSeries.first_air_date).getFullYear()}</p>
                      </>
                    )}
                  </div>
                  {product.tvSeries && (
                    <p className="text-sm mt-2 text-white hidden lg:block">{truncateOverview(product.tvSeries.overview)}</p>
                  )}
                  <button
                    onClick={() => removeBookmark(product._id,'tvSeries')}
                    className="md:mt-4 mt-2 px-2 py-2 bg-red-600 text-white rounded-md"
                  >
                     {/* <img src="delete.gif" alt="delete" className="h-6 w-6 md:h-8 md:w-8" /> */}
                     remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookmarkPage;

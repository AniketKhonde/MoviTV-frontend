import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import LoginPlease from '../components/loginPlease';
import Snackbar from '../components/Snackbar';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const DetailInfoPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get('type') || 'movie';
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError('No movie ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = {
          'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_SECRET}`,
          'Content-Type': 'application/json'
        };

        // Fetch core details
        const detailsResponse = await axios.get(
          `${TMDB_BASE_URL}/${type}/${productId}`,
          { headers }
        );
        setDetails(detailsResponse.data);

        // Fetch credits
        const creditsResponse = await axios.get(
          `${TMDB_BASE_URL}/${type}/${productId}/credits`,
          { headers }
        );
        setCredits(creditsResponse.data);

        // Fetch videos
        const videosResponse = await axios.get(
          `${TMDB_BASE_URL}/${type}/${productId}/videos`,
          { headers }
        );
        setVideos(videosResponse.data);

        // Fetch recommendations
        const recommendationsResponse = await axios.get(
          `${TMDB_BASE_URL}/${type}/${productId}/recommendations`,
          { headers }
        );
        setRecommendations(recommendationsResponse.data);
      } catch (err) {
        setError('Error fetching details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, type]);

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrailerUrl = () => {
    if (!videos?.results) return null;
    const trailer = videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        setShowLoginPopup(true);
        return;
      }

      const isTvSeries = type === 'tv';
      const endpoint = isTvSeries 
        ? `${import.meta.env.VITE_API_URL}/api/addtvseriesbookmark/tvseries`
        : `${import.meta.env.VITE_API_URL}/api/addmoviebookmark/movie`;

      const payload = isTvSeries
        ? { userId, tvSeriesId: productId, tmdbId: productId }
        : { userId, movieId: productId, tmdbId: productId };

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSnackbar({
          show: true,
          message: `${isTvSeries ? 'TV Series' : 'Movie'} bookmarked successfully!`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
      
      // Handle specific error messages from the server
      const errorMessage = error.response?.data?.error || `Failed to bookmark ${type === 'tv' ? 'TV Series' : 'Movie'}`;
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">Go to Home</span>
        </Link>
      </div>

      {showLoginPopup && <LoginPlease onClose={() => setShowLoginPopup(false)} />}
      
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
            <img
              src={`${TMDB_IMAGE_BASE_URL}/original${details.backdrop_path}`}
              alt={details.title || details.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="container mx-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      {details.title || details.name}
                    </h1>
                    {details.tagline && (
                      <p className="text-xl text-gray-300 mb-4 italic">{details.tagline}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center bg-blue-500 px-3 py-1 rounded-full">
                        <span className="text-yellow-400 mr-1">★</span>
                        {details.vote_average.toFixed(1)}
                      </div>
                      <span>{new Date(details.release_date || details.first_air_date).getFullYear()}</span>
                      {details.runtime && <span>{formatRuntime(details.runtime)}</span>}
                      <div className="flex gap-2">
                        {details.genres.map(genre => (
                          <span key={genre.id} className="bg-gray-700 px-3 py-1 rounded-full">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleBookmark}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Bookmark</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-300 leading-relaxed">{details.overview}</p>
        </div>

        {/* Cast Section */}
        {credits?.cast && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Cast</h2>
            <div className="relative">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="flex space-x-4 pb-4">
                  {credits.cast.slice(0, 10).map((member) => (
                    <div key={member.id} className="flex-shrink-0 w-48">
                      <div className="bg-gray-800 rounded-lg overflow-hidden">
                        {member.profile_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE_URL}/w185${member.profile_path}`}
                            alt={member.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-semibold truncate">{member.name}</h3>
                          <p className="text-sm text-gray-400 truncate">{member.character}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* Trailer Section */}
        {getTrailerUrl() && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
            <div className="aspect-video w-full">
              <iframe
                src={getTrailerUrl()}
                title="Trailer"
                className="w-full h-full rounded-lg"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations?.results && recommendations.results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.results.slice(0, 10).map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold truncate">{item.title || item.name}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(item.release_date || item.first_air_date).getFullYear()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TV Show Seasons Section */}
        {type === 'tv' && details.seasons && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Seasons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details.seasons.map((season) => (
                <div key={season.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  {season.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}/w500${season.poster_path}`}
                      alt={season.name}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{season.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {season.episode_count} Episodes
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {season.overview || 'No overview available.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default DetailInfoPage;

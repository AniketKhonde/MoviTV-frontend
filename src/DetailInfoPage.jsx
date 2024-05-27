import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const DetailInfoPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const source = new URLSearchParams(location.search).get('source');
  const tmdbId = new URLSearchParams(location.search).get('tmdbId');
  const type = new URLSearchParams(location.search).get('type'); // Get the type from the params
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cast, setCast] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchDetailInfo = async () => {
      try {
        const response = await axios.get(`https://movitv-backend.onrender.com/api/detailinfo/${productId}`);
        setProduct(response.data);

        const genreResponse = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=62f625f1dfefb67f969cc005860b86f6&language=en-US');
        setGenres(genreResponse.data.genres);

        let castResponse;
        if (type === 'movie') {
          castResponse = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=62f625f1dfefb67f969cc005860b86f6`);
        } else if (type === 'tvseries') {
          castResponse = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}/credits?api_key=62f625f1dfefb67f969cc005860b86f6`);
        }

        setCast(castResponse.data.cast);
      } catch (err) {
        setError('Error fetching product details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailInfo();
  }, [productId, source, tmdbId, type]);

  const getGenreNames = (genreIds) => {
    return genreIds.map(id => {
      const genre = genres.find(genre => genre.id === id);
      return genre ? genre.name : '';
    }).join(', ');
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-slate-900 text-white">
      {product && (
        <div className="p-6 rounded-lg border-2 shadow-lg flex flex-col lg:flex-row">
  
          <img src={`https://image.tmdb.org/t/p/w500${product.data.poster_path}`} alt={product.data.title} className="w-full lg:w-1/3 object-cover rounded-lg mb-4 h-auto lg:mb-0 lg:mr-4" />

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">{product.data.title || product.data.name }</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-500 text-xl">{product.data.vote_average}</span>
                <span className="text-gray-500">/10</span>
              </div>
              <span className="text-gray-500">{product.data.original_language.toUpperCase()}</span>
              <span className="text-gray-500">{new Date(product.data.release_date).getFullYear()}</span>
              <span className="text-gray-500">{getGenreNames(product.data.genre_ids)}</span>
            </div>
            <p className="mb-4">{product.data.overview}</p>
            <h2 className="text-xl font-bold mb-2">Cast</h2>
            <ul className="flex flex-wrap">
              {cast.slice(0, 10).map((member) => (
                <li key={member.cast_id} className="bg-white text-black rounded-full py-1 px-3 mr-2 mb-2">{member.name} as {member.character}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailInfoPage;

import React from 'react';
import { Link } from 'react-router-dom';

const LoginPlease = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <img 
            src="/info.gif" 
            alt="Login Required" 
            className="w-24 h-24 mb-4"
          />
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-300 mb-6">
            Please login to bookmark movies and TV shows
          </p>
          <div className="flex space-x-4">
            <Link
              to="/LoginPage"
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/RegisterPage"
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPlease;  
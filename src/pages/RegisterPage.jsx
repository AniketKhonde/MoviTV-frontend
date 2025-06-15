import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateUsername = () => {
        if (!username) {
            setUsernameError('Username is required');
            return false;
        }
        setUsernameError('');
        return true;
    };

    const validateEmail = () => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Invalid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = () => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleRegister = async () => {
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isUsernameValid && isEmailValid && isPasswordValid) {
            try {
                setIsLoading(true);
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, {
                    username,
                    email,
                    password
                });

                if (response.data) {
                    localStorage.setItem('token', response.data.jwtToken);
                    localStorage.setItem('userId', response.data.userId);
                    navigate('/');
                }
            } catch (error) {
                console.error('Error registering user:', error);
                setRegisterError(error.response?.data?.message || 'An error occurred while registering');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleRegister();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 bg-cover bg-center">
            {/* Home Button */}
            <div className="absolute top-4 left-4">
                <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">Go to Home</span>
                </Link>
            </div>

            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl transform transition-all hover:scale-[1.02]">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <img src="/login_icon.gif" alt="Logo" className="w-32 h-32 rounded-full shadow-lg" />
                        <h2 className="mt-4 text-2xl font-bold text-white">Create Account</h2>
                        <p className="text-gray-400 mt-2">Join us to start your journey</p>
                    </div>

                    {/* Register Form */}
                    <form className="space-y-6" onKeyPress={handleKeyPress}>
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                            <input
                                type="text"
                                id="username"
                                className={`mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${usernameError ? 'border-red-500' : ''}`}
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={validateUsername}
                            />
                            {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                id="email"
                                className={`mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${emailError ? 'border-red-500' : ''}`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmail}
                            />
                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                type="password"
                                id="password"
                                className={`mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${passwordError ? 'border-red-500' : ''}`}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validatePassword}
                            />
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>

                        {/* Register Button */}
                        <button
                            type="button"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            onClick={handleRegister}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Register Error */}
                        {registerError && (
                            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                                <p className="text-red-500 text-sm text-center">{registerError}</p>
                            </div>
                        )}
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/LoginPage" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

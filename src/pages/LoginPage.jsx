import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        // Handle Google OAuth callback
        const handleGoogleCallback = async () => {
            console.log("Callback handler started");
            console.log("Current location:", location);
            console.log("Search params:", location.search);
            
            // Check for auth success and user data in URL
            const auth = new URLSearchParams(location.search).get('auth');
            const userDataStr = new URLSearchParams(location.search).get('userData');
            
            if (auth === 'success' && userDataStr) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userDataStr));
                    console.log("Received user data:", userData);

                    if (userData?.success && userData?.user) {
                        console.log("Authentication successful, storing user data");
                        // Store user data
                        localStorage.setItem('token', userData.user.googleId);
                        localStorage.setItem('userId', userData.user.googleId);
                        localStorage.setItem('userName', userData.user.name);
                        localStorage.setItem('userEmail', userData.user.email);
                        localStorage.setItem('userPicture', userData.user.picture);
                        
                        // Show success message
                        setLoginError('');
                        
                        // Redirect to home page
                        navigate('/');
                    } else {
                        console.error("Invalid user data format:", userData);
                        setLoginError('Failed to authenticate with Google: Invalid user data format');
                    }
                } catch (error) {
                    console.error('Error processing user data:', error);
                    setLoginError('Failed to process authentication data. Please try again.');
                }
            } else {
                console.log("No auth data found in URL");
            }
        };

        // Check if we're in the callback flow
        if (location.search.includes('auth=success')) {
            console.log("Detected auth success URL, starting callback handler");
            handleGoogleCallback();
        }
    }, [location.search, navigate]);

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

    const handleLogin = async () => {
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            try {
                setIsLoading(true);
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
                    email,
                    password
                });

                if (response.data) {
                    localStorage.setItem('token', response.data.jwtToken);
                    localStorage.setItem('userId', response.data.userId);
                    navigate('/');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                setLoginError(error.response?.data?.message || 'An error occurred while logging in');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleLogin = () => {
        console.log("Starting Google login process");
        setIsGoogleLoading(true);
        const redirectUri = `${window.location.origin}/LoginPage`;
        console.log("Redirect URI:", redirectUri);
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
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
                        <h2 className="mt-4 text-2xl font-bold text-white">Welcome Back!</h2>
                        <p className="text-gray-400 mt-2">Please sign in to continue</p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6" onKeyPress={handleKeyPress}>
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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validatePassword}
                            />
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>

                        {/* Login Button */}
                        <button
                            type="button"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            onClick={handleLogin}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            disabled={isGoogleLoading}
                            onClick={handleGoogleLogin}
                            className="w-full py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center space-x-2"
                        >
                            {isGoogleLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    Connecting...
                                </div>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        {/* Login Error */}
                        {loginError && (
                            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                                <p className="text-red-500 text-sm text-center">{loginError}</p>
                            </div>
                        )}
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don&apos;t have an account?{' '}
                            <Link to="/RegisterPage" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

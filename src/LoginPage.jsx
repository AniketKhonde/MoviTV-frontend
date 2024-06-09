import React, { useState } from 'react';
import { Link } from 'react-router-dom';



const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');


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
                const response = await fetch('https://movi-tv-backend.vercel.app/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                console.log("code reached upt ok");
                if (response.ok) {
                    const data = await response.json();
                    // console.log("hepan Ahe kayre pay br",data.userId)
                    localStorage.setItem('token', data.jwtToken);
                    localStorage.setItem('userId', data.userId);
                    window.location.href = '/';// Redirect to the landing page
                } else {
                    setLoginError('Invalid email or password');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                setLoginError('An error occurred while logging in');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-900  bg-cover bg-center h-screen">
            
            <div className="flex-grow flex items-center justify-center">
                <div className="max-w-md md:w-full bg-white p-8 shadow-md rounded-md">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <img src="/login_icon.gif" alt="Logo" className="w-28 h-28 rounded-full" />
                        <p><b>Log in</b></p>
                    </div>
                    {/* Login Form */}
                    <form className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block font-medium">Email</label>
                            <input
                                type="email"
                                id="email"
                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${emailError ? 'border-red-500' : ''}`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmail}
                            />
                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block font-medium">Password</label>
                            <input
                                type="password"
                                id="password"
                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${passwordError ? 'border-red-500' : ''}`}
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
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleLogin}
                        >
                            Login
                        </button>
                        {/* Login Error */}
                        {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
                    </form>
                    <p className='p-4'>Not have account! <Link to="/RegisterPage" className="text-blue-600">Register here</Link></p>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;

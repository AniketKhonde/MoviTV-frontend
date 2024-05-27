import React, { useState } from 'react';



const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
  
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
                // Perform registration logic and connect to the database
                const response = await fetch('https://movitv-backend.onrender.com/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('Registration successful:', data);
                    localStorage.setItem('token', data.jwtToken);
                    localStorage.setItem('userId', data.userId); // Adjust here to use data.userId
                
                    // Redirect to the landing page
                    window.location.href = '/'; // Replace '/landing' with the actual URL of your landing page
                } else {
                    // Handle error responses from the server
                    console.error('Error registering user:', response.statusText);
                    // Display error message to the user
                }
            } catch (error) {
                console.error('Error registering user:', error);
                // Handle other errors (e.g., network errors)
            }
        }
    };
    

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900  bg-cover bg-center h-screen">
            <div className="max-w-md md:w-full bg-white p-8 shadow-md rounded-md">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center mb-4">
                        <img src="/login_icon.gif" alt="Logo" className="w-28 h-28 rounded-full" />
                        <p><b>Register</b></p>
                </div>
                {/* Register Form */}
                <form className="space-y-4">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block font-medium">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${usernameError ? 'border-red-500' : ''}`} 
                            placeholder="Enter your username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            onBlur={validateUsername}
                        />
                        {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                    </div>
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
                    {/* Register Button */}
                    <button 
                        type="button" 
                        className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={handleRegister}
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;

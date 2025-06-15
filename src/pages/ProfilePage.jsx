import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userPicture = localStorage.getItem('userPicture');

        if (token) {
            // If we have Google login data
            if (userEmail || userName) {
                setProfile({
                    fullName: userName,
                    email: userEmail,
                    picture: userPicture,
                    isGoogleUser: true
                });
                setEditedProfile({
                    fullName: userName,
                    email: userEmail,
                    picture: userPicture,
                    isGoogleUser: true
                });
                setIsLoading(false);
                } else {
                // For manual login, fetch profile data
                fetchProfile(token);
            }
        } else {
            setError('Please login to view your profile');
            setIsLoading(false);
        }
    }, []);

    console.log("profile",profile);

    const fetchProfile = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${token}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            
            const data = await response.json();
            setProfile(data);
            setEditedProfile(data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to save changes');
            return;
        }

        try {
            setIsLoading(true);
            const formattedDateOfBirth = editedProfile.dateOfBirth 
                ? new Date(editedProfile.dateOfBirth).toISOString().split('T')[0] 
                : null;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saveProfile/${token}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editedProfile,
                    dateOfBirth: formattedDateOfBirth
                })
            });

                    if (!response.ok) {
                throw new Error('Failed to update profile');
                    }

            const data = await response.json();
                    setProfile(data);
                    setEditing(false);
            setError(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setEditedProfile(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (name.startsWith('contact.')) {
            const contactField = name.split('.')[1];
            setEditedProfile(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [contactField]: value
                }
            }));
        } else {
            setEditedProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    const renderProfileName = () => {
        if (profile?.fullName !== "undefined") {
            return profile.fullName;
        } else if (profile?.email) {
            // Get the part of email before @ and capitalize first letter
            const nameFromEmail = profile.email.split('@')[0];
            return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        } else if (profile?.contact?.email) {
            const nameFromEmail = profile.contact.email.split('@')[0];
            return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        }
        return 'U';
    };

    const renderProfileEmail = () => {
        if (profile?.email) {
            return profile.email;
        } else if (profile?.contact?.email) {
            return profile.contact.email;
        }
        return 'No email provided';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center">
                    <h2 className="text-2xl text-white mb-4">Oops!</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/LoginPage')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Home Button */}
            <div className="absolute top-4 left-4">
                <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">Go to Home</span>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                    <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
                </div>

                <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                            <img 
                                src={profile?.picture || '/profile_icon.gif'} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full border-4 border-slate-800 shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 pb-8 px-8">
                        {editing ? (
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={editedProfile?.fullName || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {!profile?.isGoogleUser && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                                <input
                                                    type="text"
                                                    name="gender"
                                                    value={editedProfile?.gender || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={editedProfile?.dateOfBirth || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Street</label>
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={editedProfile?.address?.street || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    name="address.city"
                                                    value={editedProfile?.address?.city || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                                                <input
                                                    type="text"
                                                    name="address.state"
                                                    value={editedProfile?.address?.state || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                                                <input
                                                    type="text"
                                                    name="address.country"
                                                    value={editedProfile?.address?.country || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                                <input
                                                    type="text"
                                                    name="contact.phone"
                                                    value={editedProfile?.contact?.phone || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="contact.email"
                                            value={editedProfile?.contact?.email || profile?.email || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={profile?.isGoogleUser}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white">
                                        {renderProfileName()}
                                    </h2>
                                    <p className="text-gray-400">
                                        {renderProfileEmail()}
                                    </p>
                                </div>

                                {!profile?.isGoogleUser && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                                            <div className="space-y-3">
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Gender:</span> {profile?.gender || 'Not specified'}
                                                </p>
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Date of Birth:</span> {profile?.dateOfBirth || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-700 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                                            <div className="space-y-3">
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Phone:</span> {profile?.contact?.phone || 'Not specified'}
                                                </p>
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Email:</span> {profile?.contact?.email || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-700 p-4 rounded-lg md:col-span-2">
                                            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                                            <div className="space-y-3">
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Street:</span> {profile?.address?.street || 'Not specified'}
                                                </p>
                                                <p className="text-gray-300">
                                                    <span className="font-medium">City:</span> {profile?.address?.city || 'Not specified'}
                                                </p>
                                                <p className="text-gray-300">
                                                    <span className="font-medium">State:</span> {profile?.address?.state || 'Not specified'}
                                                </p>
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Country:</span> {profile?.address?.country || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!profile?.isGoogleUser && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleEdit}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import backgroundImage from '../public/background_img.jpg';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const [userId, setUserId] = useState(null); // State to store the user ID

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = parseJwt(token);
                if (decodedToken && decodedToken.userId) {
                    const userId = decodedToken.userId;
                    setUserId(userId); // Store the user ID in state
                    fetchProfile(userId); // Fetch profile data based on the user ID
                } else {
                    throw new Error('Invalid token or missing user ID');
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.error('Token not found in localStorage');
        }
    }, []);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const fetchProfile = (userId) => {
        fetch(`https://movitv-backend.onrender.com/api/profile/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }
                return response.json();
            })
            .then(data => {
                setProfile(data);
                setEditedProfile(data);
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
    };

    useEffect(() => {
        // Initialize editedProfile with profile data
        if (profile) {
            const initialEditedProfile = { ...profile };

            // Initialize contact fields with empty strings if they are null or undefined
            if (!initialEditedProfile.contact) {
                initialEditedProfile.contact = {};
            }
            if (!initialEditedProfile.contact.email) {
                initialEditedProfile.contact.email = '';
            }
            if (!initialEditedProfile.contact.phone) {
                initialEditedProfile.contact.phone = '';
            }

            setEditedProfile(initialEditedProfile);
        }
    }, [profile]);

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        if (token && userId) {
            // Format the date to 'yyyy-MM-dd' before sending
            const formattedDateOfBirth = editedProfile.dateOfBirth ? new Date(editedProfile.dateOfBirth).toISOString().split('T')[0] : null;

            fetch(`https://movitv-backend.onrender.com/api/saveProfile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editedProfile,
                    dateOfBirth: formattedDateOfBirth
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update profile data');
                    }
                    return response.json();
                })
                .then(data => {
                    setProfile(data);
                    setEditing(false);
                })
                .catch(error => {
                    console.error('Error updating profile data:', error);
                });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address')) {
            // If it's an address field, update the address object
            const addressField = name.split('.')[1]; // Extract the field name (street, city, state, country)
            setEditedProfile(prevState => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [addressField]: value
                }
            }));
        } else if (name.startsWith('contact')) {
            // If it's a contact field, update the contact object
            const contactField = name.split('.')[1]; // Extract the field name (email, phone)
            setEditedProfile(prevState => ({
                ...prevState,
                contact: {
                    ...prevState.contact,
                    [contactField]: value
                }
            }));
        } else {
            // For non-address and non-contact fields, update directly
            setEditedProfile(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    return (

        <div className="container mx-auto px-4 md:py-16  bg-cover bg-center h-screen bg-slate-900" >
            <h1 className="md:text-3xl text-xl font-semibold text-white mb-4 flex justify-center items-center">
                <span style={{ paddingRight: '0.5rem' }}>~</span>
                Profile
                <span style={{ paddingLeft: '0.5rem' }}>~</span>
            </h1>
            {profile && (
                <div className="md:w-1/2 w-3/4 flex justify-center mx-auto border border-gray-600 rounded-md">
                    <div className="bg-slate-600 rounded-lg shadow-2xl p-6 flex-col w-full flex justify-center items-center">
                        
                        <img src={'/profile_icon.gif'} alt="Profile" className="w-28 h-28 mb-4 rounded-full " />

                        <div className='border border-grey-800 p-4 rounded-md bg-white shadow-md'>
                        {editing ? (
                            <form>
                                <input type="text" name="fullName" placeholder="Your Name" value={editedProfile.fullName || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md " />
                                <input type="text" name="gender" placeholder="Gender" value={editedProfile.gender || ''} onChange={handleChange} className="w-1/2 mb-2  p-1 border rounded-md" />
                                <input type="date" name="dateOfBirth" value={editedProfile.dateOfBirth || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="text" name="address.street" placeholder="Street" value={editedProfile.address.street || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="text" name="address.city" placeholder="City" value={editedProfile.address.city || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="text" name="address.state" placeholder="State" value={editedProfile.address.state || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="text" name="address.country" placeholder="Country" value={editedProfile.address.country || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="email" name="contact.email" placeholder="Email" value={editedProfile.contact.email || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                                <input type="text" name="contact.phone" placeholder="Phone" value={editedProfile.contact.phone || ''} onChange={handleChange} className="w-1/2 mb-2 p-1 border rounded-md" />
                            </form>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2"> {profile.fullName || "your name"}</h2>
                                <p className="text-gray-600 mb-2"><b>Gender:</b> {profile.gender || "Please edit"}</p>
                                <p className="text-gray-600 mb-2"><b>Date of Birth:</b> {profile.dateOfBirth || "Please edit"}</p>
                                <p className="text-gray-600 mb-2"><b>Address:</b> {profile.address.street || "Please edit"}, {profile.address.city || "Please edit"}, {profile.address.state || "Please edit"}, {profile.address.country || "Please edit"}</p>
                                <p className="text-gray-600 mb-2"><b>Email:</b> {profile.contact.email || "Please edit"}</p>
                                <p className="text-gray-600 mb-2"><b>Phone:</b> {profile.contact.phone || "Please edit"}</p>
                            </>
                        )}
                        {editing ? (
                            <button onClick={handleSave} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Save</button>
                        ) : (
                            <button onClick={handleEdit} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Edit</button>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ProfilePage;

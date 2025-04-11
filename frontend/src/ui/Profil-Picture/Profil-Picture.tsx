import React, { useState, useEffect } from "react";
import { fetchUserToken } from "../../loader/loader";
import { useParams } from "react-router-dom";

export default function ProfilPicture() {
    const [profilePicture, setProfilePicture] = useState<string>("/assets/profile-default.svg");
    const { userId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserToken()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Failed to fetch user data');
                })
                .then((data) => {
                    // If the user has a profile picture, use it
                    if (data.user.profilePicture) {
                        setProfilePicture(data.user.profilePicture);
                    } else {
                        // If no profile picture, use default
                        setProfilePicture("/assets/profile-default.svg");
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error.message);
                    // Keep default profile picture on error
                });
        }
    }, [userId]);

    return (
        <div className="w-20 h-20 mx-auto rounded-full border-bg overflow-hidden shadow-md border-2 border-gray-300 transition-all duration-300 ease-in-out cursor-pointer hover:transform hover:shadow-lg active:scale-95">
            <img 
            src={profilePicture} 
            alt="Avatar" 
            className="w-full h-full object-cover border-2"
            />
        </div>
    )
}
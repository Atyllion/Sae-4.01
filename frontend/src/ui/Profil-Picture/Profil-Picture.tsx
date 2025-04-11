import React, { useState, useEffect } from "react";
import { fetchUserToken } from "../../loader/loader";
import { useParams } from "react-router-dom";
import UrlFront from "../../loader/Url-Front/Url-Front";

interface ProfilePictureProps {
    userId?: string;
}

export default function ProfilPicture({ userId: propUserId }: ProfilePictureProps) {
    const defaultProfileImage = `${UrlFront()}/assets/profile-default.svg`;
    const [profilePicture, setProfilePicture] = useState<string>(defaultProfileImage);
    const { userId: paramUserId } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const BASE_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            
            try {
                // Determine which userId to use - prop, param, or current user
                const targetUserId = propUserId || paramUserId;
                
                if (targetUserId) {
                    // Toujours faire cette requête, qu'on ait un token ou non
                    // car les profils publics sont accessibles sans authentification
                    const response = await fetch(`${BASE_URL}/user/profile/${targetUserId}`);
                    if (!response.ok) throw new Error('Failed to fetch user profile');
                    const userData = await response.json();
                    
                    if (userData.profilePicturePath) {
                        setProfilePicture(`${BASE_URL}/uploads/${userData.profilePicturePath}`);
                    }
                } else {
                    // Pour l'utilisateur actuel, toujours besoin du token
                    const token = localStorage.getItem('token');
                    if (token) {
                        const response = await fetchUserToken();
                        if (!response.ok) throw new Error('Failed to fetch user data');
                        const data = await response.json();
                        
                        if (data.user.profilePicture) {
                            setProfilePicture(data.user.profilePicture);
                        } else if (data.user.profilePicturePath) {
                            setProfilePicture(`${BASE_URL}/uploads/${data.user.profilePicturePath}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                // Keep default profile picture on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [propUserId, paramUserId]);

    return (
        <div className="w-15 h-15 rounded-full border-bg overflow-hidden shadow-md border-2 border-gray-300 md:items-start transition-all duration-300 ease-in-out cursor-pointer hover:transform hover:shadow-lg active:scale-95 md:w-20 md:h-20">
            {isLoading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : (
                <img 
                    src={profilePicture} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultProfileImage;
                    }}
                />
            )}
        </div>
    );
}
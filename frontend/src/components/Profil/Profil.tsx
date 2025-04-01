import React, { useEffect, useState } from 'react';
import { fetchUserToken, fetchUserById } from '../../loader/loader';
import Feed from '../Feed/Feed';
import { data, useParams } from 'react-router-dom';
import ProfileHeader from '../../ui/Profil-Header/Profil-Header';
import BackButton from '../../ui/Button-Back/Button-Back';

export default function Profil() {
    const { userId } = useParams();
    const [userData, setUserData] = useState<{
        username: string;
        id: string;
        email?: string;
        isVerified?: boolean;
        bio?: string;
        localization?: string;
    } | null>(null);
    const [localisation, getLocalization] = useState<string | null>(null);
    const [bio, getBio] = useState<string | null>(null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token && !userId) {
            // Si pas de token et pas d'userId, rediriger vers la page de login
            window.location.href = '/login';
            return;
        }
        
        setLoading(true);
        
        if (!userId && token) {
            // Profil de l'utilisateur actuellement connecté
            fetchUserToken()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Failed to fetch user data');
                })
                .then((data) => {
                    setUserData({
                        username: data.user.username,
                        email: data.user.email,
                        id: data.user.id,
                        isVerified: data.user.isVerified,
                        bio: data.user.bio,
                        localization: data.user.localization,
                    });
                    setIsCurrentUser(true);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error.message);
                    setError('Impossible de charger les données utilisateur');
                    setUserData(null);
                    setLoading(false);
                });
                
        } else if (userId) {
            // Profil d'un autre utilisateur
            fetchUserById(userId)
                .then((data) => {
                    setUserData({
                        username: data.username,
                        id: data.id,
                        isVerified: data.isVerified,
                        bio: data.bio,
                        localization: data.localization,
                    });
                    
                    // Vérifier si c'est l'utilisateur courant
                    if (token) {
                        return fetchUserToken().then(res => res.json());
                    }
                    return { user: { id: null } };
                })
                .then((tokenData) => {
                    if (tokenData.user && tokenData.user.id == userId) {
                        setIsCurrentUser(true);
                        
                        // Set individual state values instead of updating the whole object
                        if (tokenData.user.bio) {
                            getBio(tokenData.user.bio);
                        }
                        
                        if (tokenData.user.localization) {
                            getLocalization(tokenData.user.localization);
                        }
                        
                        // Update remaining userData properties
                        setUserData(prevData => ({
                            ...prevData,
                            email: tokenData.user.email,
                            isVerified: tokenData.user.isVerified
                        }));
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching user profile:', error);
                    setError("Impossible de charger le profil utilisateur");
                    setLoading(false);
                });
        }
    }, [userId]);

    if (loading) {
        return <div className="text-center p-8">Chargement du profil utilisateur...</div>;
    }

    if (error || !userData) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error || "Une erreur s'est produite"}</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className=''>
            <div className="p-6 rounded-lg shadow-md">

                {/* Bouton de retour */}
                <BackButton />

                {/* Header du profil */}
                <ProfileHeader
                    userData={userData}
                    isCurrentUser={isCurrentUser}
                    loading={loading}
                    error={error}
                />

                {/* Feed avec les posts de l'utilisateur */}
                <Feed 
                    userId={userData.id} 
                    title={isCurrentUser ? "Mes posts" : `Posts de ${userData.username}`} 
                />
            </div>
        </div>
    );
}
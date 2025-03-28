import React, { useEffect, useState } from 'react';
import { fetchUserToken, fetchUserById } from '../../loader/loader';
import Feed from '../Feed/Feed';
import { useParams } from 'react-router-dom';

export default function Profil() {
    const { userId } = useParams();
    const [userData, setUserData] = useState<{
        username: string;
        id: string;
        email?: string;
        isVerified?: boolean;
    } | null>(null);
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
                        
                        // Compléter avec les données complètes de l'utilisateur
                        setUserData(prevData => ({
                            ...prevData,
                            email: tokenData.user.email,
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
                <button
                    onClick={() => window.history.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded mt-4 md:mt-0 self-start mb-4"
                >
                    Retour
                </button>

                <div className='flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-lg shadow-md'>
                    <h1 className="text-xl text-bg sm:text-2xl font-bold mb-4 text-center sm:text-left">
                        {isCurrentUser ? 'Mon profil' : `Profil de ${userData.username}`}
                    </h1>
                    <p className="text-base text-bg sm:text-lg">
                        <strong>Nom d'utilisateur :</strong> {userData.username}
                    </p>
                    {isCurrentUser && userData.email && (
                        <p className="text-base text-bg sm:text-lg">
                            <strong>Email :</strong> {userData.email}
                        </p>
                    )}
                    {userData.isVerified !== undefined && (
                        <p className="text-base text-bg sm:text-lg">
                            <strong>Statut :</strong> {userData.isVerified ? (
                                <span className="text-green-500">Vérifié</span>
                            ) : (
                                <span className="text-gray-500">Non vérifié</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Feed avec les posts de l'utilisateur */}
                <Feed 
                    userId={userData.id} 
                    title={isCurrentUser ? "Mes posts" : `Posts de ${userData.username}`} 
                />
            </div>
        </div>
    );
}
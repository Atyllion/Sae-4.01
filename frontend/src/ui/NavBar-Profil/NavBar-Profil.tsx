import React, { useEffect, useState } from 'react';
import { fetchUserToken } from '../../loader/loader';
import DisconnectButton from '../Disconnect-Button/Disconnect-Button';
import ProfilPicture from '../Profil-Picture/Profil-Picture';
import { Link } from 'react-router-dom';

export default function NavBarProfil() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<string>("/assets/profile-default.svg");

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
                    setUsername(data.user.username); // Affiche username de l'utilisateur dans la navbar
                    setUserId(data.user.id); // Stocke l'ID de l'utilisateur
                    
                    // Récupère le chemin de la photo de profil si disponible
                    if (data.user.profilePicturePath) {
                        setProfilePicture(`http://localhost:8080/uploads/${data.user.profilePicturePath}`);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error.message);
                    setUsername(null);
                    setUserId(null);
                });
        } else {
            setUsername(null);
            setUserId(null);
        }
    }, []);

    function handleClickOnLogin() {
        window.location.href = '/login';
    }

    return (
        <>
            {username ? (
                <li className="flex flex-row md:flex-col gap-4 items-center">
                    
                    {/* Avatar avec photo de profil personnalisée */}
                    <Link
                        className="text-bg font-bold hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer"
                        to="/profil"
                        title={`Accès au profil de ${username}`}
                    >
                        {userId ? (
                            <div className="w-20 h-20 rounded-full overflow-hidden">
                                <img
                                    className="w-full h-full object-cover"
                                    src={profilePicture}
                                    alt={`Profil de ${username}`}
                                    onError={(e) => {
                                        // En cas d'erreur, utiliser l'image par défaut
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/assets/profile-default.svg";
                                    }}
                                />
                            </div>
                        ) : (
                            <img
                                className="max-w-10 max-h-10 rounded-full aspect-square"
                                src="/assets/profile-default.svg" 
                                alt={`Profil de ${username}`}
                            />
                        )}
                    </Link>

                    {/* Déconnexion */}
                    <DisconnectButton />

                </li>
            ) : (
                <li className="cursor-pointer">
                    <button
                        onClick={handleClickOnLogin}
                        className="bg-fg rounded-4xl p-2 text-bg cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out transform"
                        title="Se connecter" 
                    >
                        <img
                            className="max-w-10 max-h-10 aspect-square"
                            src="/assets/profile-default.svg"
                            alt="Profile-Default"
                        />
                    </button>
                </li>
            )}
        </>
    );
}
import React, { useEffect, useState } from 'react';
import { fetchUserToken } from '../../loader/loader';
import DisconnectButton from '../Disconnect-Button/Disconnect-Button';

export default function NavBarProfil() {
    const [username, setUsername] = useState<string | null>(null);

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
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error.message);
                    setUsername(null);
                });
        } else {
            setUsername(null);
        }
    }, []);

    function handleClickOnLogin() {
        window.location.href = '/login';
    }

    return (
        <>
            {username ? (
                <li className="flex flex-row md:flex-col gap-4 items-center">
                    
                    {/* Avatar */}
                    <a
                        className="text-bg font-bold hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105"
                        href="/profil"
                    >
                        <span className="from-primary to-bg bg-clip-text" title="Accès au profil" >
                            Salut {username}
                        </span>
                    </a>

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

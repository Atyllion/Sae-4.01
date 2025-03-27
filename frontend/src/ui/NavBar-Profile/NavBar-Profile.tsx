import React, { useEffect, useState } from 'react';
import { fetchUserToken } from '../../loader/loader';

export default function NavBarProfile() {
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
                    console.log('User data:', data); // Affiche les données utilisateur dans la console
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
                <li className="Profile-section">
                    <span className="text-bg">Salut {username} !</span>
                </li>
            ) : (
                <li className="Profile-section">
                    <button
                        onClick={handleClickOnLogin}
                        className="bg-fg rounded-4xl p-2 text-bg"
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

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

    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    return (
        <>
            {username ? (
                <li className="flex flex-row md:flex-col gap-4 items-center md:scale-110">
                    {/* Avatar */}
                    <a
                        className="text-bg font-bold hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105"
                        href="/profil"
                    >
                        <span className="from-primary to-bg bg-clip-text" title="Accès au profil" >
                            Salut {username}
                        </span>
                    </a>

                    {/* boutton de déconnexion */}
                    <>
                        {/* Bouton de déconnexion qui ouvre le pop-up de confirmation */}
                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 cursor-pointer hover:shadow-lg"
                            title="Déconnexion" 
                        >
                            Déconnexion
                        </button>

                        {/* Pop-up de confirmation */}
                        {showConfirmation && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                    <p className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                                    <div className="flex justify-center gap-4">
                                        {/* Bouton pour confirmer la déconnexion */}
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('token');
                                                window.location.reload();
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                        >
                                            Oui
                                        </button>
                                        {/* Bouton pour annuler la déconnexion */}
                                        <button
                                            onClick={() => setShowConfirmation(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                        >
                                            Non
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>

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

import React, { useState } from 'react';

export default function DisconnectButton() {
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
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

                <div className="fixed md:fixed md:top-0 md:right-0 md:left-0 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">

                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full min-w-[300px] max-w-md mx-auto transform translate-x-0 translate-y-0">
                        
                        <p className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>

                        <div className="flex flex-col space-y-3 justify-center">

                            {/* Bouton pour confirmer la déconnexion */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer active:scale-90"
                            >
                                Oui
                            </button>

                            {/* Bouton pour annuler la déconnexion */}
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer active:scale-90"
                            >
                                Non
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
import React, { useState } from 'react';
import DynamicButton from '../Button-CTA/Button-CTA';

export default function DisconnectButton() {
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <>
            {/* Bouton de déconnexion qui ouvre le pop-up de confirmation */}
            <DynamicButton
                label="Déconnexion"
                size='medium'
                onClick={() => setShowConfirmation(true)}
                variant="danger"
                className="w-full"
            />

            {/* Pop-up de confirmation */}
            {showConfirmation && (

                <div className="fixed md:fixed md:top-0 md:right-0 md:left-0 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">

                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full min-w-[300px] max-w-md mx-auto transform translate-x-0 translate-y-0">

                        <p className="text-lg font-semibold mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>

                        <div className="flex flex-col space-y-3 justify-center">

                            {/* Bouton pour confirmer la déconnexion */}
                            <DynamicButton
                                label="Oui"
                                onClick={handleLogout}
                                variant="danger"
                                className="w-full"
                            />

                            {/* Bouton pour annuler la déconnexion */}
                            <DynamicButton
                                label="Non"
                                onClick={() => setShowConfirmation(false)}
                                variant="secondary"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
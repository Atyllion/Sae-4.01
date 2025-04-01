// loader
import { fetchUsers, banUser, unbanUser, fetchUserById, fetchUserToken } from '../../loader/loader';

// react
import React from 'react';

// style
import { useState, useEffect } from 'react';
import { patchUserById } from '../../loader/loader';

export default function BackofficeUser({ user }: { user: { id: string; email: string; username: string; isBanned?: boolean } }) {

    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [error, setError] = useState<string | null>(null);
    const [isBanned, setIsBanned] = useState(user.isBanned || false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    {/* récupère le token pour savoir quel est l'utilisateur */ }
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
                    setCurrentUserId(data.user.id); // Stocke l'ID de l'utilisateur actuellement connecté
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error.message);
                });
        }
    }, []);

    useEffect(() => {
        const fetchBanStatus = async () => {
            try {
                const userData = await fetchUserById(user.id);
                setIsBanned(userData.isBanned || false);
            } catch (err) {
                console.error('Error fetching user ban status:', err);
                setError('Erreur lors de la récupération du statut de l\'utilisateur.');
            }
        };

        fetchBanStatus();
    }, [user.id]);

    const handleSave = async () => {
        // Fetch the latest user data from the backend to compare
        let latestUserData: { id: string; email: string; username: string }[];
        try {
            latestUserData = await fetchUsers();
            const currentUser = latestUserData.find((u: { id: string }) => u.id === user.id);

            if (!currentUser) {
                alert('Utilisateur introuvable.');
                setError('Utilisateur introuvable.');
                return;
            }

            // Compare input values with backend data
            const updatedData: { username?: string; email?: string } = {};

            if (username.trim() && username !== currentUser.username) {
                updatedData.username = username;
            }

            if (email.trim() && email !== currentUser.email) {
                updatedData.email = email;
            }

            // If no changes, do nothing
            if (Object.keys(updatedData).length === 0) {
                alert('Aucune modification détectée.');
                setError('Aucune modification détectée.');
                return;
            }

            // Save changes to the backend
            try {
                await patchUserById(user.id, updatedData);
                alert('Modifications enregistrées avec succès.');
                setError(null);
            } catch (err) {
                console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
                setError('Une erreur est survenue lors de la mise à jour.');
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des données utilisateur :', err);
            setError('Une erreur est survenue lors de la récupération des données utilisateur.');
        }
    };

    const handleBanUser = async () => {
        setIsProcessing(true);
        try {
            await banUser(user.id);
            setIsBanned(true);
            alert(`L'utilisateur ${user.username} a été banni avec succès.`);
        } catch (err) {
            console.error('Erreur lors du bannissement de l\'utilisateur :', err);
            setError('Une erreur est survenue lors du bannissement de l\'utilisateur.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnbanUser = async () => {
        setIsProcessing(true);
        try {
            await unbanUser(user.id);
            setIsBanned(false);
            alert(`L'utilisateur ${user.username} a été débanni avec succès.`);
        } catch (err) {
            console.error('Erreur lors du débannissement de l\'utilisateur :', err);
            setError('Une erreur est survenue lors du débannissement de l\'utilisateur.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <li className="w-full max-w-md border border-gray-300 rounded-lg shadow-md bg-gray-50 flex flex-col gap-6">

            <div className="flex flex-col gap-6 p-4 m-2">

                {/* nom d'utilisateur + input */}
                <div className="flex flex-col justify-center items-start w-full mb-4">
                    <div className="flex flex-row items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-600">Utilisateur :</h3>
                        <p className="text-xl text-gray-800">{user.username}</p>
                    </div>
                    <input
                        id='username__input'
                        type="text"
                        placeholder={`Modifier le nom d'utilisateur de ${user.username}`}
                        className="mt-2 p-4 w-full text-black padding border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"

                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                {/* e-mail + input */}
                <div className="flex flex-col justify-center items-start w-full mb-4">
                    <div className="flex flex-row items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-600">E-mail :</h3>
                        <p className="text-xl text-gray-800">{user.email}</p>
                    </div>
                    <input
                        id='email__input'
                        type="email"
                        placeholder={`Modifier l'email de ${user.email}`}
                        className="mt-2 p-4 w-full padding border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className='flex flex-col gap-4 w-full'>
                    {/* bouton de submit */}
                    <div className="flex justify-center w-full">
                        <button
                            id='save__button'
                            onClick={handleSave}
                            type="submit"
                            className="padding bg-indigo-600 text-white font-medium p-4 rounded-md shadow hover:bg-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 w-full"
                        >
                            Enregistrer les modifications
                        </button>
                    </div>

                    {/* Display error messages */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Boutons de ban/unban */}
                    <div className="flex flex-col justify-center w-full">
                        {String(user.id) !== String(currentUserId) && (
                            <button
                                id={isBanned ? "unban__button" : "ban__button"}
                                onClick={isBanned ? handleUnbanUser : handleBanUser}
                                disabled={isProcessing}
                                className={`padding text-white font-medium p-3 rounded-md shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 w-full ${
                                    isBanned 
                                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-400" 
                                        : "bg-red-600 hover:bg-red-700 focus:ring-red-400"
                                }`}
                            >
                                {isProcessing 
                                    ? 'En cours...' 
                                    : isBanned 
                                        ? 'Débannir l\'utilisateur' 
                                        : 'Bannir l\'utilisateur'
                                }
                            </button>
                        )}
                    </div>
                </div>

            </div>

        </li>
    );
}

// loader
import { fetchUsers, banUser, unbanUser, fetchUserById, fetchUserToken } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

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
        setIsProcessing(true);
        setError(null);

        try {
            // Fetch the latest user data from the backend to compare
            const latestUserData = await fetchUsers();
            const currentUser = latestUserData.find((u: { id: string }) => u.id === user.id);

            if (!currentUser) {
                setError('Utilisateur introuvable.');
                setIsProcessing(false);
                return;
            }

            // Compare input values with backend data
            const updatedData: { username?: string; email?: string } = {};

            // Only update username if it's different from the current one AND not empty
            if (username.trim() && username !== currentUser.username) {
                // Check for duplicates
                const usernameExists = latestUserData.some(
                    (u: any) => u.id !== user.id && u.username === username.trim()
                );

                if (usernameExists) {
                    setError("Ce nom d'utilisateur est déjà utilisé par un autre compte.");
                    setIsProcessing(false);
                    return;
                }

                updatedData.username = username.trim();
            }

            // Only update email if it's different from the current one AND not empty
            // Also check if email field was actually changed by the user
            if (email.trim() && email !== user.email) {
                // Check for duplicates
                const emailExists = latestUserData.some(
                    (u: any) => u.id !== user.id && u.email === email.trim()
                );

                if (emailExists) {
                    setError("Cet email est déjà utilisé par un autre compte.");
                    setIsProcessing(false);
                    return;
                }

                updatedData.email = email.trim();
            }

            // If no changes, do nothing
            if (Object.keys(updatedData).length === 0) {
                setError('Aucune modification détectée.');
                setIsProcessing(false);
                return;
            }

            // Save changes to the backend
            await patchUserById(user.id, updatedData);
            alert('Modifications enregistrées avec succès.');
            setError(null);
        } catch (err: any) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);

            // Afficher un message d'erreur spécifique
            if (err.message && err.message.includes('Email already in use')) {
                setError('Cet email est déjà utilisé par un autre compte.');
            } else if (err.message && err.message.includes('Username already in use')) {
                setError("Ce nom d'utilisateur est déjà utilisé par un autre compte.");
            } else {
                setError('Une erreur est survenue lors de la mise à jour.');
            }
        } finally {
            setIsProcessing(false);
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
        <li className="w-full max-w-md h-full border border-gray-300 rounded-lg shadow-md bg-gray-50 flex flex-col gap-6">

            <div className="flex flex-col gap-6 p-4 m-2">

                {/* nom d'utilisateur + input */}
                <div className="flex flex-col justify-center items-start w-full mb-4">

                    <div className="flex flex-row items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-600">Utilisateur :</h3>
                        <p className="text-xl text-gray-800 max-w-45 truncate" title={user.username}>{user.username}</p>
                    </div>

                    <input
                        id='username__input'
                        type="text"
                        value={username}
                        className="mt-2 p-4 w-full text-black padding border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <p className='text-xs text-bg italic text-gray-500'>Modifier le nom d'utilisateur de cette utilisateur</p>
                </div>

                {/* e-mail + input */}
                <div className="flex flex-col justify-center items-start w-full mb-4">

                    <div className="flex flex-row items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-600">E-mail :</h3>
                        <p
                            className="text-xl text-gray-800 max-w-45 truncate"
                            title={user.email}
                        >
                            {user.email}
                        </p>
                    </div>

                    <input
                        id='email__input'
                        type="email"
                        value={email}
                        className="mt-2 p-4 w-full padding border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <p className='text-xs text-bg italic text-gray-500'>Modifier le mail de cette utilisateur</p>
                </div>

                <div className='flex flex-col gap-4 w-full'>
                    {/* bouton de submit */}
                    <div className="flex justify-center w-full">
                        <DynamicButton
                            label="Enregistrer les modifications"
                            onClick={handleSave}
                            variant="primary"
                            className="padding font-medium p-4 rounded-md shadow w-full"
                        />
                    </div>

                    {/* message d'erreur */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Boutons de ban/unban */}
                    <div className="flex flex-col justify-center w-full">
                        {String(user.id) !== String(currentUserId) && (
                            <DynamicButton
                                label={isProcessing ? 'En cours...' : (isBanned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur')}
                                onClick={isBanned ? handleUnbanUser : handleBanUser}
                                variant={isBanned ? "success" : "danger"}
                                disabled={isProcessing}
                                isLoading={isProcessing}
                                className="padding font-medium p-3 rounded-md shadow w-full"
                            />
                        )}
                    </div>
                </div>

            </div>

        </li>
    );
}

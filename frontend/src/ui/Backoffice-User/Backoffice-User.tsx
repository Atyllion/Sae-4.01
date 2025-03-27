// loader
import { fetchUsers } from '../../loader/loader';

// react
import React from 'react';

// style
import { useState } from 'react';
import { patchUserById } from '../../loader/loader';

export default function BackofficeUser({ user }: { user: { id: string; email: string; username: string } }) {

    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <li className="w-full max-w-md border border-gray-300 rounded-lg shadow-md bg-gray-50 flex flex-col gap-6">

            <div className="flex flex-col gap-6 p-2">

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
                        className="mt-2 w-full text-black padding border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"

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
                        className="mt-2 w-full padding border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* bouton de submit */}
                <div className="mt-6 flex justify-center">
                    <button
                        id='save__button'
                        onClick={handleSave}
                        type="submit"
                        className="padding bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
                    >
                        Enregistrer les modifications
                    </button>
                </div>

            </div>
        </li>
    );
}

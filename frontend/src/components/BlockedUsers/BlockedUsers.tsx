import React, { useState, useEffect } from 'react';
import { getBlockedUsers, unblockUser } from '../../loader/loader';
import BackButton from '../../ui/Button-Back/Button-Back';
import { Link } from 'react-router-dom';

interface BlockedUser {
    id: string;
    username: string;
    profilePicturePath: string | null;
}

export default function BlockedUsers() {
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const users = await getBlockedUsers();
            setBlockedUsers(users);
        } catch (err) {
            console.error('Error fetching blocked users:', err);
            setError('Impossible de charger la liste des utilisateurs bloqués');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId);
            // Mettre à jour la liste des utilisateurs bloqués
            setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
            alert("Utilisateur débloquer avec succés")
        } catch (err) {
            console.error('Error unblocking user:', err);
            setError('Impossible de débloquer cet utilisateur');
        }
    };

    const [confirmUnblock, setConfirmUnblock] = useState<string | null>(null);

    const handleUnblockClick = (userId: string) => {
        setConfirmUnblock(userId);
    };

    const confirmAction = async (userId: string, confirm: boolean) => {
        setConfirmUnblock(null);
        if (confirm) {
            await handleUnblock(userId);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <BackButton />
            <h1 className="text-2xl font-bold mb-6">Utilisateurs bloqués</h1>

            {loading && <p className="text-gray-600">Chargement...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && blockedUsers.length === 0 && (
                <p className="text-gray-600">Vous n'avez bloqué aucun utilisateur.</p>
            )}

            <ul className="space-y-4">
                {blockedUsers.map(user => (
                    <li key={user.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <Link to={`/user/${user.id}`} className="flex items-center gap-4">
                            <div className="w-16 h-16">
                                <img
                                    src={user.profilePicturePath
                                        ? `${BASE_URL}/uploads/${user.profilePicturePath}`
                                        : "/assets/profile-default.svg"}
                                    alt={`${user.username} profile`}
                                    className="w-full h-full rounded-full object-cover border bg-fg"
                                />
                            </div>
                            <span className="font-medium text-lg text-fg">{user.username}</span>
                        </Link>

                        {confirmUnblock === user.id ? (
                            <div className='flex flex-col p-3 rounded-md items-center justify-center'>
                                <h2 className='text-md text-fg font-base mb-3'>Voulez-vous débloquer {user.username} ?</h2>
                                <div className="flex w-full gap-2">

                                    <button
                                        onClick={() => confirmAction(user.id, true)}
                                        className="px-3 py-1 w-full bg-green-500 hover:bg-green-600 active:scale-95 rounded-md transition-colors cursor-pointer text-white hover:shadow-md"
                                    >
                                        Oui
                                    </button>

                                    <button
                                        onClick={() => confirmAction(user.id, false)}
                                        className="px-3 py-1 w-full bg-gray-500 hover:bg-gray-600 rounded-md transition-colors active:scale-95 cursor-pointer text-white hover:shadow-md"
                                    >
                                        Non
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleUnblockClick(user.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md transition-colors cursor-pointer text-white hover:shadow-md"
                            >
                                Débloquer
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
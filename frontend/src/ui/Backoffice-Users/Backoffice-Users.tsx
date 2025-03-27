// react
import React, { useEffect, useState } from 'react';

// style
import './Backoffice-Users.css';

// UI
import BackofficeUser from '../Backoffice-User/Backoffice-User';

// loader
import { fetchUsers } from '../../loader/loader';

export default function BackofficeUsers() {
    const [users, setUsers] = useState<{ id: string; email: string; username: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(''); // État pour la recherche

    async function loadUsers() {
        try {
            const users = await fetchUsers() as { id: string; email: string; username: string }[];
            console.log('Utilisateurs récupérés :', users);
            setUsers(users);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.username.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const hasNoResults = filteredUsers.length === 0;

    return (
        <div className="user-list flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
            <div className='flex flex-col gap-4 justify-center items-center'>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 max-w-sm text-center text-fg">
                    Liste des utilisateurs
                </h1>
                <input
                    id='backoffice-search'
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="mt-2 w-full max-w-sm padding border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* liste des users */}
            <div className="w-full h-screen min-w-80 overflow-y-auto overflow-x-hidden md:flex-grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {hasNoResults ? (
                    <p className="text-center text-fg mt-4">Aucun utilisateurs trouvé</p>
                ) : (
                    <ul className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4">
                        {filteredUsers.map((user) => (
                            <BackofficeUser key={user.email} user={user} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
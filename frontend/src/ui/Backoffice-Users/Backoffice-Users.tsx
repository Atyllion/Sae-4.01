// react
import React, { useEffect, useState } from 'react';

// UI
import BackofficeUser from '../Backoffice-User/Backoffice-User';
import BackButton from '../Button-Back/Button-Back';

// loader
import { fetchUsers } from '../../loader/loader';

export default function BackofficeUsers() {
    const [users, setUsers] = useState<{ id: string; email: string; username: string; isBanned?: boolean }[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(''); // État pour la recherche
    const [filterOption, setFilterOption] = useState<string>('all'); // État pour le filtre

    async function loadUsers() {
        try {
            const fetchedUsers = await fetchUsers();
            
            // Normalisez les données pour assurer que isBanned existe et est de type boolean
            const normalizedUsers = fetchedUsers.map(user => ({
                ...user,
                // Vérifie toutes les variantes possibles de la propriété isBanned
                isBanned: user.isBanned === true || user.isBan === true || user.isBanned === 1 || user.isBan === 1
            }));
            
            setUsers(normalizedUsers);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    // Appliquer les filtres
    const filteredUsers = users.filter((user) => {
        // Filtrer par recherche de nom d'utilisateur
        const matchesSearchTerm = user.username.trim().toLowerCase().includes(searchTerm.trim().toLowerCase());
        
        // Filtrer par statut (banni ou actif)
        let matchesFilterOption = true;
        if (filterOption === 'banned') {
            matchesFilterOption = Boolean(user.isBanned) === true;
            console.log(`User ${user.username} isBanned: ${user.isBanned}, matches filter: ${matchesFilterOption}`);
        } else if (filterOption === 'active') {
            matchesFilterOption = Boolean(user.isBanned) !== true;
        }
        
        return matchesSearchTerm && matchesFilterOption;
    });

    // Le reste du composant reste inchangé
    const hasNoResults = filteredUsers.length === 0;

    return (
        // Le reste du JSX reste inchangé
        <div className="flex flex-col h-screen gap-4 px-2 sm:px-4 lg:px-8">
            {/* Header (removed sticky positioning) */}
            <div className="bg-background/95 backdrop-blur-sm shadow-sm py-4 px-2 w-full transition-all duration-300">

                <h1 className="text-xl sm:text-2xl w-fit lg:text-3xl font-bold mb-2 text-center text-fg animate-fade-in">
                    Liste des utilisateurs
                </h1>

                {/* Recherche */}
                <div className="relative w-full max-w-sm">
                    <input
                        id='backoffice-search'
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* liste des users */}
            <div className="flex-1 w-full overflow-y-auto pb-4">
                {hasNoResults ? (
                    <p className="text-center text-fg mt-8 animate-pulse">Aucun utilisateur trouvé</p>
                ) : (
                    <ul className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 jus gap-4 px-2">
                        {filteredUsers.map((user) => (
                                <BackofficeUser user={user} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
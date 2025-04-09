// UI components
import BackofficeUsers from '../../ui/Backoffice-Users/Backoffice-Users';
import BackofficePosts from '../../ui/Backoffice-Posts/Backoffice-Posts';
import NavBar from '../NavBar/NavBar';
import BackButton from '../../ui/Button-Back/Button-Back';

// Components
import React from 'react';
import { useState, useEffect } from 'react';
import { fetchUserToken } from '../../loader/loader';

export default function Backoffice() {
    const [userAdmin, setUserAdmin] = useState(null); // null au départ pour différencier l'état de chargement
    const [activePage, setActivePage] = useState('posts'); // 'posts' ou 'users'

    // Vérifier si l'utilisateur est admin
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
                    const roles = data.user.roles;
                    if (roles.includes('ROLE_ADMIN')) {
                        setUserAdmin(true);
                    } else {
                        setUserAdmin(false);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                    setUserAdmin(false);
                });
        } else {
            setUserAdmin(false);
        }
    }, []);

    // Pendant le chargement, affiche un indicateur
    if (userAdmin === null) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex flex-col w-full min-w-100">
                <div className="bg-background/95 backdrop-blur-sm shadow-sm py-4 px-4 md:px-8 mb-4">

                    <BackButton />

                    <h1 className="text-2xl font-bold mb-4">Administration</h1>

                    <div className="flex gap-4 border-b">
                        <button
                            onClick={() => setActivePage('posts')}
                            className={`px-4 py-2 font-bold cursor-pointer active:scale-95 transition-all ${
                                activePage === 'posts' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-blue-600'
                            }`}
                        >
                            Modération des posts
                        </button>

                        <button
                            onClick={() => setActivePage('users')}
                            className={`px-4 py-2 font-bold cursor-pointer active:scale-95 transition-all ${
                                activePage === 'users' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-blue-600'
                            }`}
                        >
                            Gestion des utilisateurs
                        </button>
                    </div>
                </div>

                {activePage === 'posts' ? <BackofficePosts /> : <BackofficeUsers />}
            </div>
            
            <NavBar isAdmin={userAdmin} />
        </div>
    );
}
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserToken } from '../../loader/loader';
import { deletePostById } from '../../loader/loader';

export default function Post({ content, created_at, id, user }: { content: string; created_at: string; id: string; user: { id: number; username: string } }) {

    // Savoir si les posts appartiennent à l'utilisateur actuellement connecté
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isAuthor, setIsAuthor] = useState(false);

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

    // Vérifie si l'utilisateur actuel est l'auteur du post
    useEffect(() => {
        if (currentUserId !== null) {
            setIsAuthor(currentUserId === user.id);
        }
    }, [currentUserId, user.id]);

    return (
        <li className='flex flex-col list-none w-[90%] p-5 border border-gray-300 rounded-md bg-fg hover:shadow-md hover:bg-fg md:m-2.5 md:p-4 md:rounded-lg md:hover:shadow-lg gap-4'>

            {isAuthor &&
                <div className='flex w-full justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm hover:bg-blue-200 transition-all duration-300'>
                    <p className='text-xs text-gray-700 font-medium'>Vous</p>
                    <button
                        className='bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 active:scale-95 transition-transform duration-200'
                        onClick={() => {
                            deletePostById(id);
                            alert('Post supprimé avec succès.');
                            window.location.reload();
                        }}
                    >
                        Supprimer
                    </button>
                </div>
            }

            {isAuthor ? (
                <Link to="/profil" className='flex flex-row items-center gap-4'>
                    <p className='text-bg font-bold text-lg max-w-4'>{user?.username || 'Unknown User'}</p>
                </Link>
            ) : (
                <Link to={`/user/${user.id}`} className='flex flex-row items-center gap-4'>
                    <p className='text-bg font-bold text-lg max-w-4 hover:text-blue-500 transition-colors'>{user?.username || 'Unknown User'}</p>
                </Link>
            )}

            <p className='text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose'>{content}</p>
            <p className='text-gray-500 text-xs italic'>
                {(() => {
                    const date = new Date(created_at);
                    // Ajoutez explicitement 1 heure si nécessaire
                    const parisDate = new Date(date.getTime() + 60 * 60 * 1000); // +1 heure en millisecondes
                    return parisDate.toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                })()}
            </p>
        </li>
    );
}
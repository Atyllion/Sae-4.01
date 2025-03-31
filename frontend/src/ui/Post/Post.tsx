import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserToken } from '../../loader/loader';
import { deletePostById } from '../../loader/loader';
import FollowButton from '../Follow-Button/FollowButton';

// UI
import PostInteraction from '../Post-Interactions/Post-Interaction';
import PostDeleteConfirmation from '../Post-Delete-Confirmation/Post-Delete-Confirmation';

export default function Post({ content, created_at, id, user }: { content: string; created_at: string; id: string; user: { id: number; username: string } }) {

    // Savoir si les posts appartiennent à l'utilisateur actuellement connecté
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
                    <p className='text-sm italic text-gray-700 font-medium'>Votre Post</p>

                    {/* Boutton de suppresion */}
                    {showDeleteConfirmation ? (
                        <PostDeleteConfirmation
                            id={id}
                            onCancel={() => setShowDeleteConfirmation(false)}
                        />
                    ) : (
                        <button
                            className='bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 active:scale-95 transition-transform duration-200 cursor-pointer'
                            onClick={() => setShowDeleteConfirmation(true)}
                            title="Supprimer le post"
                        >
                            Supprimer
                        </button>
                    )}
                </div>
            }

            <div className="flex justify-between items-center">
                <div>
                    {isAuthor ? (
                        <Link to="/profil" className='flex flex-row items-center gap-4 w-fit'>
                            <p className='text-bg font-bold text-lg w-fit py-2 hover:text-indigo-500 transition-colors' title='Votre Profil'>{user?.username || 'Unknown User'}</p>
                        </Link>
                    ) : (
                        <Link to={`/user/${user.id}`} className='flex flex-row items-center gap-4 w-fit'>
                            <p className='text-bg font-bold text-lg w-fit py-2 hover:text-blue-500 transition-colors' title={`Visiter le profil de ${user.username}`}>{user?.username || 'Unknown User'}</p>
                        </Link>
                    )}
                </div>
            </div>

            {/* Contenue du post */}
            <p className='text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose'>{content}</p>

            {/* Date de publication */}
            <p className='text-gray-500 text-xs italic'>
                {(() => {
                    const date = new Date(created_at);
                    // Ajustement de 2 heures pour corriger le décalage horaire
                    const parisDate = new Date(date.getTime() + 2 * 60 * 60 * 1000); // +2 heures en millisecondes
                    return parisDate.toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                })()}
            </p>

            {/* Composant d'interaction du post */}
            <PostInteraction postId={id} />
        </li>
    );
}
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserToken, getPostMediaUrl } from '../../loader/loader';
import ProfilPicture from '../Profil-Picture/Profil-Picture';

// UI
import PostInteraction from '../Post-Interactions/Post-Interaction';
import PostDeleteConfirmation from '../Post-Delete-Confirmation/Post-Delete-Confirmation';
import ReplySection from '../ReplySection/ReplySection';

export default function Post({
    content,
    created_at,
    id,
    user,
    repliesCount: initialRepliesCount = 0,
    media = []
}: {
    content: string;
    created_at: string;
    id: string;
    user: { id: number; username: string; isBanned?: boolean };
    repliesCount?: number;
    media?: string[];
}) {
    // État pour gérer les interactions utilisateur
    const [isAuthor, setIsAuthor] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showReplySection, setShowReplySection] = useState(false);
    const [currentRepliesCount, setCurrentRepliesCount] = useState(initialRepliesCount);
    const userBanned = user.isBanned || false;

    // Vérifier si l'utilisateur connecté est l'auteur du post
    useEffect(() => {
        const checkIfAuthor = async () => {
            try {
                const response = await fetchUserToken();
                if (response.ok) {
                    const userData = await response.json();
                    setIsAuthor(userData.user.id === user.id);
                }
            } catch (error) {
                console.error('Error checking author:', error);
            }
        };

        checkIfAuthor();
    }, [user.id]);

    // Initialiser le compteur de réponses avec la valeur fournie
    useEffect(() => {
        setCurrentRepliesCount(initialRepliesCount);
    }, [initialRepliesCount]);

    // Fonction pour basculer l'affichage des réponses
    const toggleReplySection = () => {
        setShowReplySection(!showReplySection);
    };

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
                            onClick={() => setShowDeleteConfirmation(true)}
                            className='bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 active:scale-95 transition-transform duration-200 cursor-pointer'
                        >
                            Supprimer
                        </button>
                    )}
                </div>
            }

            {/* En-tête du post avec informations sur l'utilisateur */}
            <div className='flex flex-row items-center gap-4'>
                {isAuthor ? (
                    <Link to="/profil" className='flex flex-row items-center gap-4 w-fit'>
                        {/* Image de profil */}
                        <ProfilPicture userId={user.id.toString()} />
                        <p className='text-bg font-bold text-lg w-fit py-2 hover:text-indigo-500 transition-colors' title='Votre Profil'>{user?.username || 'Unknown User'}</p>
                    </Link>
                ) : userBanned ? (
                    <div className='flex flex-row items-start bg-red-500 rounded-2xl gap-4 w-full opacity-75'>
                        <p className='text-bg font-bold text-lg text-white w-fit p-2' title='Utilisateur banni'>Utilisateur Banni</p>
                    </div>
                ) : (
                    <Link to={`/user/${user.id}`} className='flex flex-row items-center gap-4 w-fit'>
                        {/* Image de profil */}
                        <ProfilPicture userId={user.id.toString()} />
                        <p className='text-bg font-bold text-lg w-fit py-2 hover:text-blue-500 transition-colors' title={`Visiter le profil de ${user.username}`}>{user?.username || 'Unknown User'}</p>
                    </Link>
                )}
            </div>

            {/* Contenu du post */}
            <p className='text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose'>{content}</p>

            {/* Affichage des médias */}
            {media && media.length > 0 && (
                <div className={`grid gap-2 my-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {media.map((mediaPath, index) => {
                        const mediaUrl = getPostMediaUrl(mediaPath);
                        if (!mediaUrl) return null;

                        // Déterminer si c'est une vidéo ou une image
                        const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);

                        return (
                            <div key={index} className="rounded-md overflow-hidden">
                                {isVideo ? (
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="w-full max-h-80 object-cover"
                                    />
                                ) : (
                                    <img
                                        src={mediaUrl}
                                        alt={`Media ${index} for post ${id}`}
                                        className="w-full max-h-80 object-cover"
                                        loading="lazy"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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

            {/* Composant d'interaction du post - Ne pas afficher si l'utilisateur est banni */}
            {!userBanned && (
                <div className="flex flex-row items-center gap-4 mt-3 border-t pt-2 border-gray-200">
                    <PostInteraction
                        postId={id}
                        repliesCount={currentRepliesCount}
                        showReplies={showReplySection}
                        onToggleReplies={toggleReplySection}
                    />
                </div>
            )}

            {/* Section de réponses - Visible seulement quand activée */}
            {showReplySection && (
                <ReplySection
                    postId={id}
                    isExpanded={showReplySection}
                    onClose={() => setShowReplySection(false)}
                />
            )}
        </li>
    );
}

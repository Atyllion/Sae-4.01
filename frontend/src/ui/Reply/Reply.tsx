import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfilPicture from '../Profil-Picture/Profil-Picture';
import ReplyLikes from '../ReplyLikes/ReplyLikes';
import ReplyDelete from '../ReplyDelete/ReplyDelete';
import { fetchUserToken } from '../../loader/loader';

interface ReplyProps {
    id: string;
    content: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        isBanned?: boolean;
        profilePicturePath?: string;
    };
    likesCount: number;
    onDelete: () => void;
}

export default function Reply({ id, content, created_at, user, likesCount, onDelete }: ReplyProps) {
    const [isAuthor, setIsAuthor] = useState(false);

    // Vérifier si l'utilisateur connecté est l'auteur de la réponse
    useEffect(() => {
        const checkIfAuthor = async () => {
            try {
                const response = await fetchUserToken();
                if (response.ok) {
                    const userData = await response.json();
                    // Conversion explicite des deux valeurs en nombres pour une comparaison fiable
                    const userIdNum = Number(userData.user.id);
                    const authorIdNum = Number(user.id);
                    setIsAuthor(userIdNum === authorIdNum);
                }
            } catch (error) {
                console.error('Error checking author:', error);
            }
        };

        checkIfAuthor();
    }, [user.id]);

    // Vérifier si l'utilisateur est banni
    const userBanned = user.isBanned || false;

    return (
        <div className="pl-6 pt-2 pb-2 border-l-2 border-gray-200 ml-4 mt-2 mb-2">
            <div className="flex items-start space-x-3">

                {userBanned ? (
                    <div className="">
                        <span className="flex flex-row items-start font-bold bg-red-500 rounded-xl gap-4 w-full opacity-75 p-2">Utilisateur Banni</span>
                        <p className="text-sm text-gray-800 mt-1 break-words">
                            {content}
                        </p>
                    </div>
                ) : (
                    <Link to={isAuthor ? "/profil" : `/user/${user.id}`}>
                        <ProfilPicture userId={user.id.toString()} />
                    </Link>
                )}

                {/* En-tête avec nom d'utilisateur et date */}
                <div className="flex-1">


                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 text-bg w-full">

                            {!userBanned && (
                                <Link
                                    to={isAuthor ? "/profil" : `/user/${user.id}`}
                                    className="font-medium"
                                >
                                    {user.username}
                                </Link>
                            )}

                            {!userBanned && (
                                <span className="text-xs text-gray-500">
                                    {new Date(created_at).toLocaleString('fr-FR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Options de suppression pour l'auteur */}
                        {isAuthor && (
                            <ReplyDelete
                                replyId={id}
                                onDelete={onDelete}
                                isAuthor={isAuthor}
                            />
                        )}
                    </div>

                    {/* Contenu de la réponse */}
                    {!userBanned && (
                        <p className="text-sm text-gray-800 mt-1 break-words">
                            {content}
                        </p>
                    )}

                    {/* Interactions (likes) */}
                    {!userBanned && (
                        <div className="mt-2">
                            <ReplyLikes replyId={id} initialLikesCount={likesCount} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
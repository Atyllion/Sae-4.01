import React from 'react';
import PostInteraction from '../Post-Interactions/Post-Interaction';

interface PostFooterProps {
    created_at: string;
    postId: string;
    repliesCount: number;
    showReplies: boolean;
    onToggleReplies: () => void;
    userBanned: boolean;
    isEditing: boolean;
    isCensored: boolean;
}

const PostFooter: React.FC<PostFooterProps> = ({
    created_at,
    postId,
    repliesCount,
    showReplies,
    onToggleReplies,
    userBanned,
    isEditing,
    isCensored
}) => {
    return (
        <>
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

            {/* Composant d'interaction du post - Ne pas afficher si l'utilisateur est banni ou en mode édition */}
            {!userBanned && !isEditing && !isCensored && (
                <div className="flex flex-row items-center gap-4 mt-3 border-t pt-2 border-gray-200">
                    <PostInteraction
                        postId={postId}
                        repliesCount={repliesCount}
                        showReplies={showReplies}
                        onToggleReplies={onToggleReplies}
                    />
                </div>
            )}

            {/* Message explicatif pour les posts censurés */}
            {isCensored && (
                <div className="mt-3 text-xs text-gray-500 italic border-t pt-2 border-gray-200">
                    Ce contenu a été modéré et les interactions ont été désactivées.
                </div>
            )}
        </>
    );
};

export default PostFooter;
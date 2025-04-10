import React, { useState, useEffect } from 'react';
import { fetchReplies, createReply } from '../../loader/loader';
import Reply from '../Reply/Reply';
import DynamicButton from '../Button-CTA/Button-CTA';

interface ReplySectionProps {
    postId: string;
    isExpanded: boolean;
    onClose: () => void;
    onReplyCountChange?: (count: number) => void;
}

export default function ReplySection({ postId, isExpanded, onClose, onReplyCountChange }: ReplySectionProps) {
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const maxCharacters = 280;
    const isLoggedIn = !!localStorage.getItem('token');

    // Charger les réponses lorsque la section est ouverte
    useEffect(() => {
        if (isExpanded) {
            loadReplies();
        }
    }, [isExpanded, postId]);

    // Fonction pour charger les réponses
    const loadReplies = async (reset = true) => {
        if (loading) return;

        try {
            setLoading(true);
            setError(null);

            const currentPage = reset ? 1 : page;
            const data = await fetchReplies(postId, currentPage);

            if (reset) {
                setReplies(data.replies);
                if (onReplyCountChange) {
                    onReplyCountChange(data.total);
                }
            } else {
                setReplies(prev => [...prev, ...data.replies]);
            }

            setHasMore(data.has_more);
            setPage(currentPage + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to load replies');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour créer une nouvelle réponse
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            alert('Vous devez être connecté pour répondre.');
            return;
        }

        if (!content.trim()) {
            alert('Le contenu ne peut pas être vide.');
            return;
        }

        setSubmitting(true);
        try {
            const newReply = await createReply(postId, content);
            setReplies(prev => [newReply, ...prev]);
            setContent('');

            if (onReplyCountChange) {
                onReplyCountChange(replies.length + 1);
            }
        } catch (err: any) {
            console.log(err.message || 'Failed to create reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Fonction pour gérer le changement de contenu
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= maxCharacters) {
            setContent(newContent);
        }
    };

    // Fonction pour supprimer une réponse
    const handleDeleteReply = (replyId: string) => {
        setReplies(prev => prev.filter(reply => reply.id !== replyId));
    };

    // Fonction pour charger plus de réponses
    const loadMore = () => {
        if (!loading && hasMore) {
            loadReplies(false);
        }
    };

    if (!isExpanded) return null;

    return (
        <div className="mt-3 bg-gray-50 p-4 rounded-md">

            {/* header réponses */}
            <div className="flex justify-between mb-4">
                <h3 className="text-lg text-bg font-bold">Réponses</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Formulaire pour créer une réponse */}
            {isLoggedIn && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-2">
                        <textarea
                            className="w-full p-2 border text-bg border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Écrire une réponse..."
                            rows={3}
                            value={content}
                            onChange={handleContentChange}
                            maxLength={maxCharacters}
                            disabled={submitting}
                        ></textarea>
                        <div className="text-xs text-gray-500 text-right">
                            {maxCharacters - content.length} caractères restants
                        </div>
                    </div>
                    <DynamicButton
                        label={submitting ? 'Envoi en cours...' : 'Répondre'}
                        onClick={() => { }} // Le formulaire gère déjà la soumission
                        variant="primary"
                        disabled={submitting || !content.trim()}
                        isLoading={submitting}
                        className="text-sm"
                    />
                </form>
            )}

            {/* Liste des réponses */}
            {loading && page === 1 ? (
                <div className="flex justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
            ) : replies.length === 0 ? (
                <div className="text-gray-500 text-center py-4">Pas encore de réponses</div>
            ) : (
                <div>
                    {replies.map(reply => (
                        <Reply
                            key={reply.id}
                            id={reply.id}
                            content={reply.content}
                            created_at={reply.created_at}
                            user={reply.user}
                            likesCount={reply.likesCount}
                            onDelete={() => handleDeleteReply(reply.id)}
                        />
                    ))}

                    {hasMore && (
                        <DynamicButton
                            label={loading ? 'Chargement...' : 'Voir plus de réponses'}
                            onClick={loadMore}
                            variant="secondary"
                            disabled={loading}
                            isLoading={loading}
                            className="w-full text-sm py-2"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
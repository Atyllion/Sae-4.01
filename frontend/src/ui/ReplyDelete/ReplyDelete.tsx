import React, { useState } from 'react';
import { deleteReply } from '../../loader/loader';

interface ReplyDeleteProps {
    replyId: string;
    onDelete: () => void;
    isAuthor: boolean;
}

export default function ReplyDelete({ replyId, onDelete, isAuthor }: ReplyDeleteProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fonction pour supprimer la réponse
    const handleDelete = async () => {
        if (isDeleting) return;

        console.log('Attempting to delete reply:', replyId);
        setIsDeleting(true);
        try {
            const result = await deleteReply(replyId);
            console.log('Delete result:', result);
            onDelete(); // Appeler le callback pour informer le parent que la suppression est réussie
        } catch (error) {
            console.error('Error deleting reply:', error);
            alert('Échec de la suppression. Veuillez réessayer.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
        }
    };

    // Only show delete option if user is the author
    if (!isAuthor) return null;

    return (
        <div className='w-full flex justify-end'>
            {showDeleteConfirmation ? (
                <div className="flex flex-col items-center gap-2 w-full">
                    <button
                        className="text-s text-white bg-red-500 hover:bg-red-700 px-3 py-1 w-full rounded cursor-pointer active:scale-95 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Suppression...' : 'Confirmer'}
                    </button>
                    <button
                        className="text-s text-white bg-gray-500 hover:bg-gray-700 px-3 py-1 w-full rounded cursor-pointer active:scale-95 transition-colors"
                        onClick={() => setShowDeleteConfirmation(false)}
                    >
                        Annuler
                    </button>
                </div>
            ) : (
                <button
                    className="text-s text-white bg-red-500 hover:bg-red-700 px-2 py-1 rounded cursor-pointer active:scale-95 transition-colors"
                    onClick={() => setShowDeleteConfirmation(true)}
                    title="Supprimer la réponse"
                >
                    Supprimer
                </button>
            )}
        </div>
    );
}
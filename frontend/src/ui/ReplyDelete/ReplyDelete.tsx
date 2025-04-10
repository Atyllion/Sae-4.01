import React, { useState } from 'react';
import { deleteReply } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

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
                    <DynamicButton
                        label={isDeleting ? 'Suppression...' : 'Confirmer'}
                        onClick={handleDelete}
                        variant="danger"
                        disabled={isDeleting}
                        isLoading={isDeleting}
                        className="w-full"
                        size="small"
                    />
                    <DynamicButton
                        label="Annuler"
                        onClick={() => setShowDeleteConfirmation(false)}
                        variant="secondary"
                        size="small"
                        className="w-full"
                    />
                </div>
            ) : (
                <DynamicButton
                label="Supprimer"
                onClick={() => setShowDeleteConfirmation(true)}
                variant="danger"
                size="small"
            />
            )}
        </div>
    );
}
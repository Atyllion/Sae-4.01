import React from 'react';
import PostDeleteConfirmation from '../Post-Delete-Confirmation/Post-Delete-Confirmation';
import DynamicButton from '../Button-CTA/Button-CTA';

interface PostActionsProps {
    showEditForm: () => void;
    showDeleteConfirmation: boolean;
    setShowDeleteConfirmation: (show: boolean) => void;
    postId: string;
    isCensored?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
    showEditForm,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    postId,
    isCensored = false
}) => {
    return (
        <div className='flex w-full justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm hover:bg-blue-200 transition-all duration-300'>
            <p className='text-sm italic text-gray-700 font-medium'>Votre Post</p>
            <div className='flex gap-2'>

                {!isCensored && (
                    <DynamicButton
                        label="Modifier"
                        onClick={showEditForm}
                        variant="primary"
                        size="small"
                    />
                )}

                {/* Bouton de suppression */}
                {showDeleteConfirmation ? (
                    <PostDeleteConfirmation
                        id={postId}
                        onCancel={() => setShowDeleteConfirmation(false)}
                    />
                ) : (
                    <DynamicButton
                        label="Supprimer"
                        onClick={() => setShowDeleteConfirmation(true)}
                        variant="danger"
                        size="small"
                    />
                )}
            </div>
        </div>
    );
};

export default PostActions;
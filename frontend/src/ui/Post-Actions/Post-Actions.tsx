import React from 'react';
import PostDeleteConfirmation from '../Post-Delete-Confirmation/Post-Delete-Confirmation';

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
                    <button
                        // boutton de modification 
                        onClick={showEditForm}
                        className='bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600 active:scale-95 transition-transform duration-200 cursor-pointer'
                    >
                        Modifier
                    </button>
                )}

                {/* Bouton de suppression */}
                {showDeleteConfirmation ? (
                    <PostDeleteConfirmation
                        id={postId}
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
        </div>
    );
};

export default PostActions;
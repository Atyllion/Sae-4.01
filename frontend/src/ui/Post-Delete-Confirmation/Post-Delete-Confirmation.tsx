import React from "react";
import { deletePostById } from '../../loader/loader';

interface PostDeleteConfirmationProps {
    id: string;
    onCancel: () => void;
}

export default function PostDeleteConfirmation({ id, onCancel }: PostDeleteConfirmationProps) {
        return (
                <div className='flex flex-col items-center'>

                        <p className='text-base font-medium text-red-600 mb-1'>êtes vous sûr de vouloir supprimer ?</p>

                        <div className='flex justify-evenly w-full m-2 gap-2'>
                                {/* Oui */}
                                <button
                                        className='bg-red-500 text-white text-sm px-3 py-1 w-full h-full rounded-md hover:bg-red-600 active:scale-95 transition-transform duration-200 cursor-pointer'
                                        onClick={() => {
                                                deletePostById(id);
                                                alert('Post supprimé avec succès.');
                                                window.location.reload();
                                        }}
                                >
                                        Oui
                                </button>

                                {/* Non */}
                                <button
                                        className='bg-gray-400 text-white text-sm px-3 py-1 w-full h-full rounded-md hover:bg-gray-500 active:scale-95 transition-transform duration-200 cursor-pointer'
                                        onClick={onCancel}
                                >
                                        Non
                                </button>
                        </div>
                </div>
        );
}
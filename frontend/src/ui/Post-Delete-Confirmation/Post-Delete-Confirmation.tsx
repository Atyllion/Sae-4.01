import React from "react";
import { deletePostById } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

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
                                <DynamicButton
                                        label="Oui"
                                        onClick={() => {
                                                deletePostById(id);
                                                alert('Post supprimé avec succès.');
                                                window.location.reload();
                                        }}
                                        variant="danger"
                                        className="text-sm px-3 py-1 w-full"
                                />

                                {/* Non */}
                                <DynamicButton
                                        label="Non"
                                        onClick={onCancel}
                                        variant="secondary"
                                        className="text-sm px-3 py-1 w-full"
                                />
                        </div>
                </div>
        );
}
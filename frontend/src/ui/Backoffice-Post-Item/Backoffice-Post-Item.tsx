import React from 'react';
import { censorPost } from '../../loader/loader';

interface BackofficePostItemProps {
    post: {
        id: string;
        content: string;
        created_at: string;
        user: {
            id: number;
            username: string;
        };
        media?: string[];
        isCensored?: boolean;
    };
    onUpdatePost: () => void;
}

export default function BackofficePostItem({ post, onUpdatePost }: BackofficePostItemProps) {
    const handleCensorToggle = async () => {
        try {
            await censorPost(post.id);
            onUpdatePost(); // Recharger les posts après la censure
        } catch (error) {
            console.error('Erreur lors de la censure du post:', error);
            alert('Erreur lors de la censure du post. Veuillez réessayer.');
        }
    };

    return (
        <li className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-medium text-gray-800">
                        {post.user.username}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                    </p>
                </div>
                <button
                    onClick={handleCensorToggle}
                    className={`px-3 py-1 rounded-md text-white text-sm cursor-pointer active:scale-95 transition-all ${
                        post.isCensored 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {post.isCensored ? 'Annuler la censure' : 'Censurer'}
                </button>
            </div>

            <div className="p-3 bg-fg text-bg rounded border border-gray-200 mb-2">
                <p className={`text-sm ${post.isCensored ? 'italic text-gray-500' : ''}`}>
                    {post.isCensored ? (
                        'Ce message enfreint les conditions d\'utilisation de la plateforme'
                    ) : (
                        post.content
                    )}
                </p>
            </div>
        </li>
    );
}
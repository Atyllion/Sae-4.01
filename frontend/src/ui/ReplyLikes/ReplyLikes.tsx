import React, { useState, useEffect } from 'react';
import { getReplyLikes, toggleReplyLike } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

interface ReplyLikesProps {
    replyId: string;
    initialLikesCount: number;
}

export default function ReplyLikes({ replyId, initialLikesCount }: ReplyLikesProps) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);
    
    const isLoggedIn = !!localStorage.getItem('token');
    
    // Vérifier si l'utilisateur a déjà liké la réponse
    useEffect(() => {
        if (isLoggedIn) {
            const checkLikeStatus = async () => {
                try {
                    const data = await getReplyLikes(replyId);
                    setLiked(data.liked);
                    setLikesCount(data.likesCount);
                } catch (error) {
                    console.error('Failed to check like status:', error);
                }
            };
            
            checkLikeStatus();
        }
    }, [replyId, isLoggedIn]);
    
    // Fonction pour liker/unliker
    const handleToggleLike = async () => {
        if (!isLoggedIn || isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await toggleReplyLike(replyId);
            setLiked(response.liked);
            setLikesCount(response.likesCount);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleToggleLike}
                disabled={isLoading || !isLoggedIn}
                className={`focus:outline-none ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                title={liked ? 'Ne plus aimer cette réponse' : 'Aimer cette réponse'}
            >
                <svg
                    className={`h-5 w-5 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={liked ? "0" : "2"}
                    fill={liked ? "currentColor" : "none"}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                </svg>
            </button>
            <span className="text-xs text-gray-600">
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </span>
        </div>
    );
}
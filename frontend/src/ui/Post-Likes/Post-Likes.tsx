import React, { useState, useEffect } from "react";
import { toggleLike, getPostLikes, fetchUserToken } from "../../loader/loader";
import DynamicButton from '../Button-CTA/Button-CTA';

interface PostLikesProps {
    postId: string;
}

export default function PostLikes({ postId }: PostLikesProps) {
    const [liked, setLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Vérifier si l'utilisateur est connecté et charger les likes initiaux
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        loadLikes();
    }, [postId]);

    const loadLikes = async () => {
        try {
            const likesData = await getPostLikes(postId);
            setLikesCount(likesData.likesCount);
            setLiked(likesData.liked);
        } catch (error) {
            console.error("Erreur lors du chargement des likes:", error);
        }
    };

    const handleToggleLike = async () => {

        if (!isLoggedIn) {
            alert("Vous devez être connecté pour liker un post");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await toggleLike(postId);
            setLiked(response.liked);
            setLikesCount(response.likesCount);
        } catch (error) {
            console.error("Erreur lors du like/unlike:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleLike}
            disabled={isLoading || !isLoggedIn}
            title={liked ? "Ne plus aimer ce post" : "Aimer ce post"}
            className="flex flex-row transition-transform duration-200 active:scale-95 focus:outline-none items-center gap-2 mt-3 cursor-pointer group"
            aria-label={liked ? "Unlike" : "Like"}
            id="like-button"
        >
            <svg
            className={`h-7 w-7 cursor-pointer
                ${liked
                ? 'text-red-500 fill-red-500 active:scale-95'
                : 'text-gray-500 group-hover:text-red-500'
                }`
            }
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

            <span className="text-sm font-medium text-gray-600" title={`${likesCount} likes`}>
            {likesCount} {likesCount === 1
                ? 'like'
                : 'likes'}
            </span>

        </button>
    );
}
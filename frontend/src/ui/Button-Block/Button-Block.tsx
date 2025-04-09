import React, { useState, useEffect } from 'react';
import { blockUser, unblockUser, isBlockedUser } from '../../loader/loader';

interface BlockButtonProps {
    userId: string;
}

export default function BlockButton({ userId }: BlockButtonProps) {
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        if (token) {
            loadBlockStatus();
        } else {
            setIsLoading(false);
        }
    }, [userId]);

    const loadBlockStatus = async () => {
        try {
            const response = await isBlockedUser(userId);
            setIsBlocked(response.isBlocked);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors du chargement du statut de blocage:", error);
            setIsLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!isLoggedIn) {
            alert("Vous devez être connecté pour bloquer un utilisateur");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            let response;
            if (isBlocked) {
                response = await unblockUser(userId);
            } else {
                if (window.confirm("Êtes-vous sûr de vouloir bloquer cet utilisateur ? Cette personne ne pourra plus vous suivre ni interagir avec vos posts.")) {
                    response = await blockUser(userId);
                } else {
                    setIsLoading(false);
                    return;
                }
            }
            setIsBlocked(response.isBlocked);
        } catch (error) {
            console.error("Erreur lors du changement de statut de blocage:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-9 w-24 rounded-md"></div>;
    }

    return (
        <button
            onClick={handleToggleBlock}
            disabled={!isLoggedIn}
            className={`px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 active:scale-90 shadow-sm ${
                isBlocked
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                    : 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
            }`}
            title={isBlocked ? "Débloquer cet utilisateur" : "Bloquer cet utilisateur"}
        >
            {isBlocked ? "Débloquer" : "Bloquer"}
        </button>
    );
}
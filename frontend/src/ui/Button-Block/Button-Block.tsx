import React, { useState, useEffect } from 'react';
import { blockUser, unblockUser, isBlockedUser } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

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
        <DynamicButton
            label={isBlocked ? "Débloquer" : "Bloquer"}
            onClick={handleToggleBlock}
            variant={isBlocked ? "secondary" : "danger"}
            disabled={!isLoggedIn || isLoading}
            isLoading={isLoading}
            size="small"
        />
    );
}
// src/ui/FollowButton/FollowButton.tsx
import React, { useState, useEffect } from 'react';
import { followUser, unfollowUser, isFollowingUser } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

interface FollowButtonProps {
    userId: string;
}

export default function FollowButton({ userId }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        if (token) {
            loadFollowStatus();
        } else {
            setIsLoading(false);
        }
    }, [userId]);

    const loadFollowStatus = async () => {
        try {
            const response = await isFollowingUser(userId);
            setIsFollowing(response.isFollowing);
            setFollowersCount(response.followersCount);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors du chargement du statut d'abonnement:", error);
            setIsLoading(false);
        }
    };

    const handleToggleFollow = async () => {
        if (!isLoggedIn) {
            alert("Vous devez être connecté pour suivre un utilisateur");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            let response;
            if (isFollowing) {
                response = await unfollowUser(userId);
            } else {
                response = await followUser(userId);
            }
            setIsFollowing(response.isFollowing);
            setFollowersCount(response.followersCount);
        } catch (error) {
            console.error("Erreur lors du changement de statut d'abonnement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-9 w-24 rounded-md"></div>;
    }

    return (
        <div className="flex flex-row-reverse items-center justify-center gap-2">

            {/* nombre d'abonnées */}
            <span className="text-sm text-gray-600 font-medium">
                {followersCount} {followersCount === 1 ? "abonné" : "abonnés"}
            </span>

            {/* Bouton de follow */}
            <DynamicButton
                label={isFollowing ? "Ne plus suivre" : "Suivre"}
                onClick={handleToggleFollow}
                variant={isFollowing ? "secondary" : "primary"}
                disabled={!isLoggedIn || isLoading}
                isLoading={isLoading}
                className="px-4 py-2"
            />

        </div>
    );
}
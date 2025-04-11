import React, { useState, useEffect } from "react";
import { fetchUserToken, getPublicProfilePicture, getImageUrl } from "../../loader/loader";
import { useParams } from "react-router-dom";
import UrlFront from "../../loader/Url-Front/Url-Front";

interface ProfilBannerProps {
    userId?: string;
}

export default function ProfilBanner({ userId: propUserId }: ProfilBannerProps) {
    const defaultBannerPath = `${UrlFront()}/assets/default-banner.jpg`;
    const [bannerUrl, setBannerUrl] = useState<string>(defaultBannerPath);
    const [loading, setLoading] = useState<boolean>(true);
    const { userId: paramUserId } = useParams();
    const BASE_URL = (import.meta as any).env.VITE_API_URL;
    
    useEffect(() => {
        const fetchBanner = async () => {
            setLoading(true);
            
            try {
                // Déterminer quel userId utiliser - prop, param, ou utilisateur actuel
                const targetUserId = propUserId || paramUserId;

                if (targetUserId) {
                    // Récupérer la bannière de l'utilisateur sans authentification
                    const userData = await getPublicProfilePicture(targetUserId);
                    if (userData && userData.bannerPicturePath) {
                        setBannerUrl(getImageUrl(userData.bannerPicturePath));
                    }
                } else {
                    // Pour l'utilisateur actuel, toujours besoin du token
                    const token = localStorage.getItem('token');
                    if (token) {
                        const response = await fetchUserToken();
                        if (!response.ok) throw new Error('Failed to fetch user data');
                        const data = await response.json();

                        if (data.user.bannerPicturePath) {
                            setBannerUrl(`${BASE_URL}/uploads/${data.user.bannerPicturePath}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user banner:', error);
                // Garder la bannière par défaut en cas d'erreur
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, [propUserId, paramUserId]);

    return (
        <div className="w-full h-40 md:h-60 relative overflow-hidden rounded-t-lg">
            {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : (
                <img
                    src={bannerUrl}
                    alt="Bannière de profil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultBannerPath;
                    }}
                />
            )}
        </div>
    );
}
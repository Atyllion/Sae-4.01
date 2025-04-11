import React, { useEffect, useState } from "react";
import { fetchUserToken } from "../../loader/loader";

export default function ProfilBanner() {
    const [bannerUrl, setBannerUrl] = useState<string>("/assets/default-banner.jpg");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            fetchUserToken()
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Failed to fetch user data');
                })
                .then((data) => {
                    // Si l'utilisateur a une bannière personnalisée
                    if (data.user.bannerUrl) {
                        setBannerUrl(data.user.bannerUrl);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching user banner:', error.message);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <div className="w-full h-40 md:h-60 relative overflow-hidden rounded-t-lg">
            {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : (
                <img 
                    src={bannerUrl} 
                    alt="Bannière de profil" 
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
}
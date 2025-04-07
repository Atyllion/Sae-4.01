import React from 'react';
import FollowButton from '../Follow-Button/FollowButton';
import ProfilPicture from '../Profil-Picture/Profil-Picture';
import ProfilBanner from '../Profil-Banner/Profil-Banner';

interface ProfileHeaderProps {
    userData: {
        username: string;
        id: string;
        email?: string;
        isVerified?: boolean;
        bio?: string;
        localization?: string;
        isBanned?: boolean;
        bannerPicturePath?: string;
        profilePicturePath?: string;
    } | null;
    isCurrentUser: boolean;
    loading: boolean;
    error: string | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userData,
    isCurrentUser,
    loading,
    error
}) => {
    if (loading) {
        return <div className="text-center p-4">Chargement du profil utilisateur...</div>;
    }

    if (error || !userData) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error || "Une erreur s'est produite"}</p>
            </div>
        );
    }

    console.log('userData', userData);

    return (
        <div className='flex flex-col gap-4 bg-white rounded-lg shadow-md items-start'>

            {/* Bannière de profil */}
            <ProfilBanner />

            <div className='sm:p-6 md:items-start flex flex-col w-full items-center justify-between md:flex-row md:w-full'>

                {/* Informations de l'utilisateur */}
                <div className=" flex flex-col gap-2 items-center md:items-start">

                    <div className='flex flex-col md:flex-row items-center md:justify-center gap-2'>
                        {/* Image de profil */}
                        <ProfilPicture />

                        {/* Nom de l'utilisateur */}
                        <h1 className="text-xl text-bg sm:text-2xl font-bold text-left md:text-center">
                            {isCurrentUser ? `Mon profil (${userData.username})` : `Profil de ${userData.username}`}
                        </h1>
                    </div>

                    {/* Bio de l'utilisateur */}
                    <div className="text-base italic text-gray-600 sm:text-lg max-w-md text-center md:text-left">

                        {userData.bio ? userData.bio : isCurrentUser ? "Ajoutez une bio pour vous présenter" : "Aucune bio disponible"}

                    </div>

                    {/* Localisation de l'utilisateur */}
                    <div className="text-sm text-gray-500 sm:text-base">
                        <span className="inline-flex items-center">

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>

                            {userData.localization ? userData.localization : isCurrentUser ? "Ajoutez votre localisation" : "Aucune localisation disponible"}
                        </span>
                    </div>

                    {/* Bouton modification du profil */}
                    {/* TODO */}

                    {/* Bouton d'abonnement */}
                    {!isCurrentUser && (
                        <FollowButton userId={userData.id} />
                    )}

                    {/* Status de l'utilisateur */}
                    {userData.isVerified !== undefined && (
                        <p className="text-base text-bg sm:text-lg">
                            <strong>Statut :</strong> {userData.isVerified ? (
                                <span className="text-green-500">Vérifié</span>
                            ) : (
                                <span className="text-gray-500">Non vérifié</span>
                            )}
                        </p>
                    )}

                    {/* Bouton d'acces aux paramètres */}
                    {isCurrentUser && (
                        <button
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-all duration-300 active:scale-95 active:bg-red cursor-pointer"
                            title="Modifier le profil"
                            onClick={() => window.location.href = '/parametres'}
                        >
                            Modifier le profil
                        </button>
                    )}
                </div>

            </div>

        </div>
    );
};

export default ProfileHeader;
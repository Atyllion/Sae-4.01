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

    return (
        <div className='flex flex-col gap-4 bg-white rounded-lg shadow-md items-start'>

            {/* Bannière de profil */}
            <ProfilBanner />

            <div className='sm:p-6 w-full gap-4 flex flex-col items-center md:items-start'>
                {/* Nom du profil + bouton d'abonnement */}
                <div className='flex flex-col w-full items-center gap-4 justify-between md:flex-row md:w-full'>

                    <div className='flex flex-col md:flex-row items-center gap-4'>

                        {/* Image de profil */}
                        <ProfilPicture />

                        {/* Nom de l'utilisateur */}
                        <h1 className="text-xl text-bg sm:text-2xl font-bold text-left md:text-center">
                            {isCurrentUser ? `Mon profil (${userData.username})` : `Profil de ${userData.username}`}
                        </h1>
                    </div>

                    {/* Bouton d'abonnement */}
                    {!isCurrentUser && (
                        <FollowButton userId={userData.id} />
                    )}
                </div>

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
            </div>
        </div>
    );
};

export default ProfileHeader;
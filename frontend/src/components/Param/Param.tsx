import React, { useState, useEffect } from 'react';
import {
    fetchUserToken,
    updateUserDetails,
    uploadProfilePicture,
    uploadBannerPicture,
} from '../../loader/loader';
import BackButton from '../../ui/Button-Back/Button-Back';

export default function Param() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        bio: '',
        localization: '',
        profilePicturePath: '',
        bannerPicturePath: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingFormEvent, setPendingFormEvent] = useState<React.FormEvent | null>(null);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await fetchUserToken();
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    ...userData,
                    username: data.user.username || '',
                    email: data.user.email || '',
                    bio: data.user.bio || '',
                    localization: data.user.localization || '',
                    profilePicturePath: data.user.profilePicturePath || '',
                    bannerPicturePath: data.user.bannerPicturePath || ''
                });
            } else {
                setError('Impossible de récupérer vos informations');
            }
        } catch (error) {
            setError('Une erreur est survenue');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handleConfirmationResponse = async (response: boolean) => {
        if (response && pendingFormEvent) {
            try {
                // Only handle details update
                const result = await updateUserDetails({
                    bio: userData.bio,
                    localization: userData.localization
                });
                console.log('Details updated:', result);
                alert('Profil enregistrés avec succès');
                // Optional: Show success message
                setError(null);
            } catch (error) {
                console.error('Error saving data:', error);
                setError('Une erreur est survenue lors de la sauvegarde');
            }
        }

        setShowConfirmation(false);
        setPendingFormEvent(null);
    };

    const showConfirmationModal = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingFormEvent(e);
        setShowConfirmation(true);
    };

    const ConfirmationModal = () => {
        if (!showConfirmation) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmer les modifications</h3>
                    <p className="mb-6 text-gray-600">
                        Êtes-vous sûr de vouloir enregistrer ces modifications ?
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => handleConfirmationResponse(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition cursor-pointer active:scale-95"
                        >
                            Non
                        </button>
                        <button
                            onClick={() => handleConfirmationResponse(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer active:scale-95"
                        >
                            Oui
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    // Ajoutez ces deux fonctions pour gérer l'upload des images
    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setError(null);
            try {
                // Vérifier que le dossier de destination existe et est accessible
                if (file.size > 5000000) {
                    throw new Error('La taille du fichier ne doit pas dépasser 5 Mo');
                }

                const result = await uploadProfilePicture(file);
                if (!result || !result.fileName) {
                    throw new Error('Réponse invalide du serveur');
                }
                // Mettre à jour le state avec le nouveau chemin de l'image
                setUserData({
                    ...userData,
                    profilePicturePath: result.fileName
                });
                // Afficher un message de succès temporaire
                console.log("Photo de profil téléchargée avec succès");
            } catch (error: any) {
                console.error("Erreur lors du téléchargement de la photo de profil:", error);
                const errorMessage = error.message.includes("Permission denied")
                    ? "Échec du téléchargement: problème de permission du serveur. Vérifiez que le dossier /assets/profil_pic/ existe et est accessible."
                    : `Échec du téléchargement de la photo de profil: ${error.message}`;
                setError(errorMessage);
            }
        }
    };

    const handleBannerPictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setError(null);
            try {
                // Vérifier que le dossier de destination existe et est accessible
                if (file.size > 5000000) {
                    throw new Error('La taille du fichier ne doit pas dépasser 5 Mo');
                }

                const result = await uploadBannerPicture(file);
                if (!result || !result.fileName) {
                    throw new Error('Réponse invalide du serveur');
                }
                // Mettre à jour le state avec le nouveau chemin de l'image
                setUserData({
                    ...userData,
                    bannerPicturePath: result.fileName
                });
                // Afficher un message de succès temporaire
                console.log("Bannière téléchargée avec succès");
            } catch (error: any) {
                console.error("Erreur lors du téléchargement de la bannière:", error);
                const errorMessage = error.message.includes("Permission denied")
                    ? "Échec du téléchargement: problème de permission du serveur. Vérifiez que le dossier /assets/banner_pic/ existe et est accessible."
                    : `Échec du téléchargement de la bannière: ${error.message}`;
                setError(errorMessage);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <BackButton />
            <h1 className="text-2xl font-bold mb-6 text-center">Paramètres du profil</h1>

            <ConfirmationModal />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* bio + localisation */}
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-6">
                <h2 className="text-xl text-bg font-bold mb-4">Détails du profil</h2>
                <form className='text-bg' onSubmit={showConfirmationModal}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Biographie</label>
                        <textarea
                            name="bio"
                            value={userData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Localisation</label>
                        <input
                            type="text"
                            name="localization"
                            value={userData.localization}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition cursor-pointer active:scale-95"
                        title='Enregistrer les détails du profil'
                    >
                        Enregistrer
                    </button>
                </form>
            </div>

            {/* Photos */}
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                <h2 className="text-xl text-bg font-bold mb-4">Photos du profil</h2>

                {/* Photo de profil */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Photo de profil</h3>
                    <div className="flex flex-col items-center">
                        <div className="w-40 h-40 mb-3 bg-gray-200 rounded-full overflow-hidden">
                            {userData.profilePicturePath ? (
                                <img
                                    src={`${'http://localhost:8080'}/uploads/${userData.profilePicturePath}`}
                                    alt="Photo de profil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {userData.profilePicturePath && (
                            <p className="text-sm text-gray-600 mb-2">{userData.profilePicturePath}</p>
                        )}

                        <label className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition cursor-pointer active:scale-95">
                            Choisir une image
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleProfilePictureUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Photo de bannière */}
                <div>
                    <h3 className="text-lg text-bg font-semibold mb-2">Bannière</h3>
                    <div className="flex flex-col items-center">
                        <div className="w-full h-32 mb-3 bg-gray-200 rounded overflow-hidden">
                            {userData.bannerPicturePath ? (
                                <img
                                    src={`${'http://localhost:8080'}/uploads/${userData.bannerPicturePath}`}
                                    alt="Bannière"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://via.placeholder.com/1200x300?text=Bannière";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {userData.bannerPicturePath && (
                            <p className="text-sm text-gray-600 mb-2">{userData.bannerPicturePath}</p>
                        )}

                        <label className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition cursor-pointer active:scale-95">
                            Choisir une bannière
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleBannerPictureUpload}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

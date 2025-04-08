import React, { useState, useRef, useEffect } from 'react';
import { isMediaFileSupported, getPostMediaUrl } from '../../loader/loader';

interface PostEditFormProps {
    content: string;
    media: string[];
    onSave: (content: string, mediaToRemove: string[], newMedia: File[]) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    error: string;
}

const PostEditForm: React.FC<PostEditFormProps> = ({ 
    content,
    media,
    onSave,
    onCancel,
    isSubmitting,
    error
}) => {
    const [currentContent, setCurrentContent] = useState(content);
    const [currentMedia, setCurrentMedia] = useState<string[]>(media || []);
    const [mediaToRemove, setMediaToRemove] = useState<string[]>([]);
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
    const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const maxCharacters = 280;
    const maxMediaFiles = 4;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxCharacters) {
            setCurrentContent(input);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => isMediaFileSupported(file));
        
        if (validFiles.length === 0) return;
        
        // Limiter le nombre de fichiers
        const remainingSlots = maxMediaFiles - (currentMedia.length - mediaToRemove.length + newMediaFiles.length);
        const filesToAdd = validFiles.slice(0, remainingSlots);
        
        if (filesToAdd.length === 0) return;
        
        // Ajouter les nouveaux fichiers
        setNewMediaFiles(prev => [...prev, ...filesToAdd]);
        
        // Créer des prévisualisations
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
        setNewMediaPreviews(prev => [...prev, ...newPreviews]);
        
        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeExistingMedia = (mediaPath: string) => {
        setMediaToRemove(prev => [...prev, mediaPath]);
        setCurrentMedia(prev => prev.filter(m => m !== mediaPath));
    };

    const removeNewMedia = (index: number) => {
        URL.revokeObjectURL(newMediaPreviews[index]);
        setNewMediaFiles(prev => prev.filter((_, i) => i !== index));
        setNewMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Log avant l'envoi pour vérifier que la valeur est correcte
        console.log("Submitting content:", currentContent);
        
        // Assurez-vous que la valeur n'est pas undefined
        const contentToSubmit = currentContent === undefined ? "" : currentContent;
        
        onSave(contentToSubmit, mediaToRemove, newMediaFiles);
    };

    // Nettoyage des URLs de prévisualisation
    useEffect(() => {
        return () => {
            newMediaPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newMediaPreviews]);

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">
                    {error}
                </div>
            )}
            
            <textarea
                value={currentContent}
                onChange={handleContentChange}
                className="w-full p-2 text-bg border border-gray-300 rounded-md mb-3"
                rows={4}
                placeholder="Contenu du post..."
            />
            
            <div className="text-sm text-gray-500 mb-2">
                {maxCharacters - currentContent.length} caractères restants
            </div>
            
            {/* Affichage des médias existants avec option de suppression */}
            {currentMedia.length > 0 && (
                <div className="mb-3">
                    <p className="font-medium mb-1">Médias actuels:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {currentMedia.map((mediaPath, index) => {
                            const mediaUrl = getPostMediaUrl(mediaPath);
                            if (!mediaUrl) return null;
                            
                            const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);
                            
                            return (
                                <div key={index} className="relative rounded-md overflow-hidden">
                                    {isVideo ? (
                                        <video src={mediaUrl} className="w-full h-32 object-cover" />
                                    ) : (
                                        <img src={mediaUrl} alt={`Media ${index}`} className="w-full h-32 object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeExistingMedia(mediaPath)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Affichage des nouveaux médias ajoutés */}
            {newMediaFiles.length > 0 && (
                <div className="mb-3">
                    <p className="font-medium mb-1">Nouveaux médias:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {newMediaFiles.map((file, index) => {
                            const previewUrl = newMediaPreviews[index];
                            const isVideo = file.type.startsWith('video/');
                            
                            return (
                                <div key={`new-${index}`} className="relative rounded-md overflow-hidden">
                                    {isVideo ? (
                                        <video src={previewUrl} className="w-full h-32 object-cover" />
                                    ) : (
                                        <img src={previewUrl} alt={`New media ${index}`} className="w-full h-32 object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeNewMedia(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Bouton pour ajouter des médias */}
            <div className="mb-3">
                <input
                    type="file"
                    id="media-upload"
                    ref={fileInputRef}
                    onChange={handleMediaChange}
                    accept="image/*, video/*"
                    className="hidden"
                    multiple
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                >
                    Ajouter un média
                </button>
                <span className="ml-2 text-sm text-gray-500">
                    {currentMedia.length + newMediaFiles.length}/4 médias
                </span>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
};

export default PostEditForm;
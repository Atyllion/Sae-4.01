import React, { useState, useRef, useEffect } from 'react';
import { isMediaFileSupported, updatePost, getPostMediaUrl } from '../../loader/loader';

interface EditPostProps {
    postId: string;
    initialContent: string;
    initialMedia: string[];
    onCancel: () => void;
    onUpdate: () => void;
}

export default function EditPost({ postId, initialContent, initialMedia, onCancel, onUpdate }: EditPostProps) {
    const [content, setContent] = useState(initialContent);
    const [existingMedia, setExistingMedia] = useState<string[]>(initialMedia || []);
    const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
    const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const maxCharacters = 280;
    const maxMediaFiles = 4;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxCharacters) {
            setContent(input);
        }
    };

    const handleMediaClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleNewMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => isMediaFileSupported(file));
        
        if (validFiles.length === 0) {
            setError('Formats supportés : JPG, PNG, GIF, WEBP, MP4, WEBM, OGG');
            return;
        }
        
        // Calculer combien de fichiers on peut encore ajouter
        const remainingSlots = maxMediaFiles - (existingMedia.length - mediaToDelete.length + newMediaFiles.length);
        const filesToAdd = validFiles.slice(0, remainingSlots);
        
        if (filesToAdd.length === 0) {
            setError(`Maximum ${maxMediaFiles} fichiers par post`);
            return;
        }
        
        // Ajouter les nouveaux fichiers et prévisualisations
        setNewMediaFiles(prev => [...prev, ...filesToAdd]);
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
        setNewMediaPreviews(prev => [...prev, ...newPreviews]);
        
        // Réinitialiser l'input file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeExistingMedia = (mediaPath: string) => {
        setMediaToDelete(prev => [...prev, mediaPath]);
    };

    const restoreExistingMedia = (mediaPath: string) => {
        setMediaToDelete(prev => prev.filter(path => path !== mediaPath));
    };

    const removeNewMedia = (index: number) => {
        URL.revokeObjectURL(newMediaPreviews[index]);
        setNewMediaFiles(prev => prev.filter((_, i) => i !== index));
        setNewMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content.trim() && existingMedia.length === mediaToDelete.length && newMediaFiles.length === 0) {
            setError('Votre post ne peut pas être vide');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError('');
            
            const response = await updatePost(postId, content, mediaToDelete, newMediaFiles);
            
            if (response.ok) {
                onUpdate(); // Notifier le parent que la mise à jour est terminée
            } else {
                setError('Erreur lors de la mise à jour du post');
            }
        } catch (error: any) {
            console.error('Error updating post:', error);
            setError(error.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nettoyage des URLs de prévisualisation
    useEffect(() => {
        return () => {
            newMediaPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newMediaPreviews]);

    return (
        <div className="flex flex-col border border-blue-300 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-medium mb-2">Modifier votre post</h3>
            
            {error && (
                <div className="w-full p-3 my-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="w-full">
                <textarea
                    placeholder="Modifier votre post..."
                    className="text-base w-full h-32 resize-none p-2 my-2 border rounded-md"
                    value={content}
                    onChange={handleContentChange}
                ></textarea>
                
                <div className="text-sm text-gray-500 mb-2">
                    {maxCharacters - content.length} caractères restants
                </div>
                
                {/* Affichage des médias existants */}
                {existingMedia.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Médias existants</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {existingMedia.map((mediaPath, index) => {
                                const isMarkedForDeletion = mediaToDelete.includes(mediaPath);
                                const mediaUrl = getPostMediaUrl(mediaPath);
                                const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);
                                
                                return (
                                    <div 
                                        key={`existing-${index}`} 
                                        className={`relative rounded-md overflow-hidden ${isMarkedForDeletion ? 'opacity-50' : ''}`}
                                    >
                                        {isVideo ? (
                                            <video src={mediaUrl} controls className="w-full h-32 object-cover" />
                                        ) : (
                                            <img src={mediaUrl} alt={`Media ${index}`} className="w-full h-32 object-cover" />
                                        )}
                                        
                                        <button 
                                            type="button"
                                            onClick={() => isMarkedForDeletion 
                                                ? restoreExistingMedia(mediaPath) 
                                                : removeExistingMedia(mediaPath)
                                            }
                                            className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center
                                                ${isMarkedForDeletion 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-red-500 text-white'}`}
                                        >
                                            {isMarkedForDeletion ? '↩' : '×'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Prévisualisation des nouveaux médias */}
                {newMediaPreviews.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Nouveaux médias</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {newMediaPreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative rounded-md overflow-hidden">
                                    {newMediaFiles[index]?.type.startsWith('video/') ? (
                                        <video src={preview} controls className="w-full h-32 object-cover" />
                                    ) : (
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover" />
                                    )}
                                    
                                    <button 
                                        type="button"
                                        onClick={() => removeNewMedia(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Bouton pour ajouter des médias */}
                <div className="flex items-center mb-4">
                    <button 
                        type="button" 
                        onClick={handleMediaClick} 
                        className={`flex items-center px-3 py-1 rounded-md ${
                            (existingMedia.length - mediaToDelete.length + newMediaFiles.length < maxMediaFiles) 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={existingMedia.length - mediaToDelete.length + newMediaFiles.length >= maxMediaFiles}
                    >
                        Ajouter des médias
                    </button>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                        multiple
                        onChange={handleNewMediaChange}
                        className="hidden"
                    />
                    
                    <span className="ml-2 text-sm text-gray-500">
                        {existingMedia.length - mediaToDelete.length + newMediaFiles.length}/{maxMediaFiles} fichiers
                    </span>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                </div>
            </form>
        </div>
    );
}
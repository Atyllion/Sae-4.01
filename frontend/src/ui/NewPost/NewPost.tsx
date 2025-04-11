import React, { useState, useRef } from 'react';
import { isMediaFileSupported, createPost as importedCreatePost } from '../../loader/loader';

export default function NewPost() {
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const maxCharacters = 280;
    const maxMediaFiles = 4; // Maximum 4 fichiers médias par post

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
    
    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => isMediaFileSupported(file));
        
        if (validFiles.length === 0) {
            setError('Formats supportés : JPG, PNG, GIF, WEBP, MP4, WEBM, OGG');
            return;
        }
        
        // Limiter le nombre de fichiers
        const filesToAdd = validFiles.slice(0, maxMediaFiles - mediaFiles.length);
        
        if (mediaFiles.length + filesToAdd.length > maxMediaFiles) {
            setError(`Vous pouvez ajouter jusqu'à ${maxMediaFiles} fichiers médias par post`);
        }
        
        // Ajouter les nouveaux fichiers
        setMediaFiles(prev => [...prev, ...filesToAdd]);
        
        // Créer des prévisualisations
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
        setMediaPreviews(prev => [...prev, ...newPreviews]);
        
        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const removeMedia = (index: number) => {
        // Libérer l'URL de prévisualisation pour éviter les fuites de mémoire
        URL.revokeObjectURL(mediaPreviews[index]);
        
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content.trim() && mediaFiles.length === 0) {
            setError('Veuillez ajouter du contenu ou des médias à votre post.');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Vous devez être connecté pour créer un post.');
                return;
            }
            
            setIsSubmitting(true);
            setError('');
            
            // Important : utiliser la fonction importée du loader
            const response = await importedCreatePost(content.trim(), mediaFiles);
            
            if (response.ok) {
                console.log('Post created successfully');
                setContent('');
                setMediaFiles([]);
                setMediaPreviews([]);
                
                // Nettoyez les prévisualisations pour éviter les fuites de mémoire
                mediaPreviews.forEach(url => URL.revokeObjectURL(url));
                setMediaPreviews([]);
                
                alert('Post created successfully!');
            } else {
                let errorMessage = 'Erreur lors de la création du post';
                try {
                    // Essayez de parser le JSON seulement si le Content-Type est application/json
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    }
                } catch (jsonError) {
                    console.error('Erreur lors du parsing de la réponse JSON:', jsonError);
                }
                setError(errorMessage);
            }
        } catch (error: any) {
            console.error('An error occurred while creating the post:', error);
            setError(error.message || 'Une erreur inattendue est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center bg-[var(--bg-color)] rounded-lg p-4 w-full md:w-full">
                <h1 className="text-2xl md:text-4xl leading-tight md:leading-snug">Créer un nouveau post</h1>
                
                {error && (
                    <div className="w-full p-3 my-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="w-full">
                    <textarea
                        autoComplete="true"
                        placeholder="Vous avez quoi en tête ?"
                        className="text-base leading-relaxed text-left w-full h-40 resize-none p-2 my-4 border border-[var(--border-color)] rounded-md"
                        id="post_text_content"
                        name="content"
                        rows={4}
                        cols={50}
                        value={content}
                        onChange={handleContentChange}
                    ></textarea>
                    
                    <div className="text-sm text-gray-500 mb-2">
                        {maxCharacters - content.length} Charactères Restants
                    </div>
                    
                    {/* Zone de prévisualisation des médias */}
                    {mediaPreviews.length > 0 && (
                        <div className="my-3 grid grid-cols-2 gap-2">
                            {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    {mediaFiles[index]?.type.startsWith('image/') ? (
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index}`} 
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    ) : (
                                        <video 
                                            src={preview} 
                                            controls 
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Bouton pour ajouter des médias */}
                    <div className="flex items-center mb-3">

                        <button 
                            type="button" 
                            onClick={handleMediaClick} 
                            className={`flex items-center transition-all duration-100 cursor-pointer bg-blue-500 rounded-md p-2 text-fg font-bold active:scale-95 ${mediaFiles.length >= maxMediaFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={mediaFiles.length >= maxMediaFiles}
                        >
                            <span>Ajouter des médias</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                            disabled={mediaFiles.length >= maxMediaFiles}
                        />
                        {mediaFiles.length > 0 && (
                            <span className="ml-3 text-sm text-gray-500">
                                {mediaFiles.length}/{maxMediaFiles} fichiers
                            </span>
                        )}
                    </div>
                    
                    <button
                        id="NewPostButton"
                        className="rounded-lg border border-transparent py-4 px-0 text-lg bg-fg text-bg font-bold active:scale-95 transition-all duration-100 cursor-pointer w-full focus:outline-4 disabled:opacity-50"
                        type="submit"
                        title='Créer un post'
                        disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
                    >
                        {isSubmitting ? 'En cours...' : 'Poster'}
                    </button>

                </form>
            </div>
        </>
    );
}
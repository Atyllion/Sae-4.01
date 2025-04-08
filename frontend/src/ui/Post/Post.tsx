import React, { useEffect, useState } from 'react';
import { fetchUserToken, updatePost } from '../../loader/loader';

import PostHeader from '../Post-Header/Post-Header';
import PostContent from '../Post-Content/Post-Content';
import PostActions from '../Post-Actions/Post-Actions';
import PostEditForm from '../Post-EditForm/Post-EditForm';
import PostFooter from '../Post-Footer/Post-Footer';
import ReplySection from '../ReplySection/ReplySection';

export default function Post({
    content,
    created_at,
    id,
    user,
    repliesCount: initialRepliesCount = 0,
    media = []
}: {
    content: string;
    created_at: string;
    id: string;
    user: { id: number; username: string; isBanned?: boolean };
    repliesCount?: number;
    media?: string[];
}) {
    // État pour gérer les interactions utilisateur
    const [isAuthor, setIsAuthor] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showReplySection, setShowReplySection] = useState(false);
    const [currentRepliesCount, setCurrentRepliesCount] = useState(initialRepliesCount);
    const userBanned = user.isBanned || false;

    // États pour l'édition
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentContent, setCurrentContent] = useState(content);
    const [currentMedia, setCurrentMedia] = useState<string[]>(media || []);
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState('');
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
    const [mediaToRemove, setMediaToRemove] = useState<string[]>([]);

    // Vérifier si l'utilisateur connecté est l'auteur du post
    useEffect(() => {
        const checkIfAuthor = async () => {
            try {
                const response = await fetchUserToken();
                if (response.ok) {
                    const userData = await response.json();
                    setIsAuthor(userData.user.id === user.id);
                }
            } catch (error) {
                console.error('Error checking author:', error);
            }
        };

        checkIfAuthor();
    }, [user.id]);

    // Initialiser le compteur de réponses avec la valeur fournie
    useEffect(() => {
        setCurrentRepliesCount(initialRepliesCount);
    }, [initialRepliesCount]);

    // Fonction pour basculer l'affichage des réponses
    const toggleReplySection = () => {
        setShowReplySection(!showReplySection);
    };

    // Dans la méthode handleSaveEdit du composant Post.tsx
    const handleSaveEdit = async (editedContent: string, filesToRemove: string[], newFiles: File[]) => {
        if (!editedContent.trim() && currentMedia.length - filesToRemove.length + newFiles.length === 0) {
            setEditError('Le contenu du post ne peut pas être vide.');
            return;
        }

        setIsEditing(true);
        setEditError('');

        try {
            // Debug logs
            console.log("Submitting edit with content:", editedContent);
            console.log("Current content before update:", currentContent);
            console.log("Files to remove:", filesToRemove);
            console.log("New files:", newFiles.length);

            const response = await updatePost(id, editedContent, filesToRemove, newFiles);

            // Handle the response
            if (response && typeof response === 'object') {
                console.log("Response from server:", response);
                console.log("Setting new content to:", response.content);

                // Update state with server response
                setCurrentContent(response.content || "");
                setCurrentMedia(response.media || []);
                setNewMediaFiles([]);
                setMediaToRemove([]);
                setShowEditForm(false);
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (error) {
            setEditError('Une erreur est survenue lors de la mise à jour');
            console.error('Error updating post:', error);
        } finally {
            setIsEditing(false);
        }
    };

    // Annuler l'édition
    const cancelEdit = () => {
        setCurrentContent(content);
        setCurrentMedia(media || []);
        setNewMediaFiles([]);
        setMediaToRemove([]);
        setShowEditForm(false);
        setEditError('');
    };

    return (
        <li className='flex flex-col list-none w-[90%] p-5 border border-gray-300 rounded-md bg-fg hover:shadow-md hover:bg-fg md:m-2.5 md:p-4 md:rounded-lg md:hover:shadow-lg gap-4'>
            {/* Boutons d'actions pour l'auteur */}
            {isAuthor && !showEditForm && (
                <PostActions
                    showEditForm={() => setShowEditForm(true)}
                    showDeleteConfirmation={showDeleteConfirmation}
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                    postId={id}
                />
            )}

            {/* En-tête du post avec informations sur l'utilisateur */}
            <PostHeader user={user} isAuthor={isAuthor} userBanned={userBanned} />

            {/* Formulaire d'édition ou contenu du post */}
            {isAuthor && showEditForm ? (
                <PostEditForm
                    content={currentContent}
                    media={currentMedia}
                    onSave={handleSaveEdit}
                    onCancel={cancelEdit}
                    isSubmitting={isEditing}
                    error={editError}
                />
            ) : (
                <PostContent content={currentContent} media={currentMedia} />
            )}

            {/* Pied de page du post */}
            <PostFooter
                created_at={created_at}
                postId={id}
                repliesCount={currentRepliesCount}
                showReplies={showReplySection}
                onToggleReplies={toggleReplySection}
                userBanned={userBanned}
                isEditing={showEditForm}
            />

            {/* Section de réponses - Visible seulement quand activée et pas en mode édition */}
            {showReplySection && !showEditForm && (
                <ReplySection
                    postId={id}
                    isExpanded={showReplySection}
                    onClose={() => setShowReplySection(false)}
                />
            )}
        </li>
    );
}
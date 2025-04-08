const BASE_URL = 'http://localhost:8080';

// Récupérer un post par son ID
export async function fetchPosts(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/posts?page=${page}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
            return response.status === 204 ? null : await response.json();
        }
        return response;
    } catch (error) {
        console.error('Erreur lors du chargement des posts :', error);
        throw error;
    }
}

// Créer un post (avec ou sans médias)
export async function createPost(content: string, mediaFiles: File[] = []) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to create a post.');
        }

        let response;
        
        // Si nous avons des fichiers médias, utiliser FormData
        if (mediaFiles && mediaFiles.length > 0) {
            const formData = new FormData();
            formData.append('content', content);
        
            mediaFiles.forEach((file, index) => {
                formData.append(`media[${index}]`, file);
            });
        
            response = await fetch(`${BASE_URL}/posts_create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
        } else {
            // Sinon, utiliser JSON comme avant
            const userResponse = await fetchUserToken();
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userResponse.json();
            const postData = { 
                content: content,
                user: userData.id
            };

            response = await fetch(`${BASE_URL}/posts_create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error creating post: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Mettre à jour un post (avec ou sans médias)
export async function updatePost(postId: string, content: string, mediaToDelete: string[] = [], mediaFiles: File[] = []) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. Please log in to update a post.');
        }

        console.log("Updating post - Content:", content);
        console.log("Media to delete:", mediaToDelete);
        console.log("New media files:", mediaFiles.length);

        const formData = new FormData();
        formData.append('content', content);
        
        // Important: Utiliser cette méthode pour que PHP puisse correctement analyser le tableau
        if (mediaToDelete.length > 0) {
            mediaToDelete.forEach((path, index) => {
                // Envoyez les chemins exacts tels qu'ils sont stockés
                formData.append(`mediaToDelete[${index}]`, path);
            });
        }
        
        if (mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media[]', file);
            });
        }
        
        // Changé: Utilisation de la méthode POST sur la nouvelle URL
        const response = await fetch(`${BASE_URL}/post/${postId}/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error updating post: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response from server:", data);
        return data;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

// Fonction utilitaire pour vérifier si un fichier est une image ou une vidéo
export function isMediaFileSupported(file: File): boolean {
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    return [...supportedImageTypes, ...supportedVideoTypes].includes(file.type);
}

// Fonction pour obtenir l'URL d'un média de post
export function getPostMediaUrl(mediaPath: string) {
    if (!mediaPath) return null;
    return `${BASE_URL}/uploads/${mediaPath}`;
}

// Récupérer tous les tokens
export async function fetchAllTokens() {
    try {
        const response = await fetch(`${BASE_URL}/get_tokens`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des tokens :', error);
        throw error;
    }
}

// Récupérer tous les posts
export async function fetchAllPosts() {
    try {
        const response = await fetch(`${BASE_URL}/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Erreur lors du chargement des posts :', error);
        throw error;
    }
}

// Récupérer un post par son ID
export async function deletePostById(postId: string) {
    try {
        const response = await fetch(`${BASE_URL}/post/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return; // Return nothing for successful deletion
    } catch (error) {
        console.error('Erreur lors de la suppression du post :', error);
        throw error;
    }
}

// Récupérer les posts d'un utilisateur
export async function fetchUserPosts(userId: string, page = 1) {
    try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        // Add token to headers if available, but don't require it
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/posts/user/${userId}?page=${page}`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw error;
    }
}

// Récupérer tous les utilisateurs
export async function fetchUsers() {
    try {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Assurez-vous que les objets utilisateur ont une propriété isBanned
        return data.map((user: any) => ({
            ...user,
            isBanned: user.isBan || false  // Assurer que la propriété est disponible
        }));
        
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        throw error;
    }
}

// Récupérer le profil d'un utilisateur
export async function fetchUserById(userId: string) {
    try {
        const response = await fetch(`${BASE_URL}/user/profile/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Mettre à jour les informations d'un utilisateur
export async function patchUserById(userId: string, userData: { username?: string; email?: string }) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No token found. Please log in to update user data.');
        }
        
        const response = await fetch(`${BASE_URL}/updateuser/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Ajout du token d'authentification
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            // Vérifier d'abord le type de contenu
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
            } else {
                // Si ce n'est pas du JSON, retourner le texte brut ou un message d'erreur générique
                const textError = await response.text();
                console.error('Réponse brute du serveur:', textError);
                throw new Error(`Erreur HTTP : ${response.status}. Le serveur n'a pas renvoyé de JSON valide.`);
            }
        }

        // Vérifier également si la réponse réussie est bien du JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            console.warn('La réponse réussie n\'est pas au format JSON');
            return { success: true, message: 'Utilisateur mis à jour avec succès' };
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        throw error;
    }
}

// Récupérer le token de l'utilisateur
export async function loginUser(userData: { email: string; password: string }) {
    console.log("userData", userData);

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json', // Ensure the server knows the client expects JSON
            },
            body: JSON.stringify({
                email: userData.email, // Pass the email
                password: userData.password, // Pass the password
            }),
        });

        console.log("response loader : ", response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.error || 'Invalid credentials. Please check your email and password.');
        }

        return response;

    } catch (error) {
        console.error('Erreur lors de la connexion de l\'utilisateur :', error);
        throw error;
    }
}

// Récupérer le token de l'utilisateur
export async function fetchUserToken(): Promise<Response> {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found in localStorage');
        }

        const response = await fetch(`${BASE_URL}/get_token`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ajoute les informations d'authentification à la requête
        });

        if (response.status === 401) {
            // le token n'est plus valide, on le supprime
            console.error('Token expired or invalid. Removing from localStorage.');
            localStorage.removeItem('token');
            throw new Error('Your session has expired. Please log in again.');
        }

        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération du token :', error);
        throw error;
    }
}

// Récupérer les posts initiaux
export async function fetchInitialPosts() {
    try {
        const response = await fetch(`${BASE_URL}/posts`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des posts initiaux :', error);
        throw error;
    }
}

// Récupérer les posts d'un utilisateur
export async function signInUser(userData: { username: string; email: string; password: string }) {
    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to sign in user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error during user sign-in:', error);
        throw error;
    }
}

// Récupérer les posts aimés par l'utilisateur
export async function toggleLike(postId: string) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to like a post.');
        }

        const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

// Récupérer les likes d'un post
export async function getPostLikes(postId: string) {
    try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        // Ajouter le token à l'en-tête s'il existe
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/api/posts/${postId}/likes`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching post likes:', error);
        throw error;
    }
}

// Récupérer les réponses d'un post
export async function fetchReplies(postId: string, page: number = 1, limit: number = 10) {
    try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/replies?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Error fetching replies: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }
}

// Créer une réponse à un post
export async function createReply(postId: string, content: string) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No token found. Please log in to reply to a post.');
        }
        
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        
        if (!response.ok) {
            throw new Error(`Error creating reply: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating reply:', error);
        throw error;
    }
}

// Supprimer une réponse
export async function deleteReply(replyId: string) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No token found. Please log in to delete a reply.');
        }
        
        console.log(`Attempting to delete reply with ID: ${replyId}`);
        
        const response = await fetch(`${BASE_URL}/api/replies/${replyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`Delete response status: ${response.status}`);
        
        if (!response.ok) {
            let errorMsg = `Error deleting reply: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg += ` - ${errorData.error || 'Unknown error'}`;
            } catch (e) {
                // Ignore JSON parsing error
            }
            throw new Error(errorMsg);
        }
        
        console.log('Reply deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting reply:', error);
        throw error;
    }
}

// Liker ou unliker une réponse
export async function toggleReplyLike(replyId: string) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No token found. Please log in to like a reply.');
        }
        
        const response = await fetch(`${BASE_URL}/api/replies/${replyId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error toggling reply like: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error toggling reply like:', error);
        throw error;
    }
}

// Vérifier si l'utilisateur a liké une réponse
export async function getReplyLikes(replyId: string) {
    try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${BASE_URL}/api/replies/${replyId}/likes`, {
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching reply likes: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching reply likes:', error);
        throw error;
    }
}

// Récupérer le nombre de réponse pour un post
export async function fetchReplyCount(postId: string) {
    try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/replies/count`);
        
        if (!response.ok) {
            throw new Error(`Error fetching reply count: ${response.status}`);
        }
        
        const data = await response.json();
        return data.repliesCount; // Changed to match the key from the backend
    } catch (error) {
        console.error('Error fetching reply count:', error);
        return 0;
    }
}

// Suivre un utilisateur
export async function followUser(userId: string) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to follow users.');
        }

        const response = await fetch(`${BASE_URL}/api/users/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
}

// Annuler le suivi d'un utilisateur
export async function unfollowUser(userId: string) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to unfollow users.');
        }

        const response = await fetch(`${BASE_URL}/api/users/${userId}/unfollow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
}

// Récupérer les utilisateurs suivis par l'utilisateur
export async function fetchUserFollowing() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to view your follows.');
        }

        const response = await fetch(`${BASE_URL}/api/users/following`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user following:', error);
        throw error;
    }
}

// Vérifier si l'utilisateur suit un autre utilisateur
export async function isFollowingUser(userId: string) {
    try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/api/users/${userId}/is-following`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking follow status:', error);
        throw error;
    }
}

// Récupérer les posts d'un utilisateur
export async function fetchFeedPosts(feedType = 'all', page = 1) {
    try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/posts?feed=${feedType}&page=${page}`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw error;
    }
}

// Bannir un utilisateur
export async function banUser(userId: string) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to perform this action.');
        }

        const response = await fetch(`${BASE_URL}/ban/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
}

// Débannir un utilisateur
export async function unbanUser(userId: string) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to perform this action.');
        }

        const response = await fetch(`${BASE_URL}/unban/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw error;
    }
}

// Fonction utilitaire pour récupérer les images de profil sans authentification
export async function getPublicProfilePicture(userId: string) {
    try {
        const response = await fetch(`${BASE_URL}/user/profile/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching public profile picture:', error);
        return null;
    }
}

// Fonction utilitaire pour construire l'URL complète d'une image
export function getImageUrl(path: string | null) {
    if (!path) return "/assets/profile-default.svg";
    return `${BASE_URL}/uploads/${path}`;
}

// MISE A JOUR DES INFOS UTILISATEUR

// Mettre à jour les détails du profil (bio, localisation)
export async function updateUserDetails(detailsData: { bio?: string; localization?: string }) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${BASE_URL}/user-update-details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(detailsData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile details');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating profile details:', error);
        throw error;
    }
}

// Uploader une photo de profil
export async function uploadProfilePicture(file: File) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Check file size before uploading (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
        }
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Ne pas définir l'en-tête Content-Type - le navigateur le fera automatiquement avec le boundary
        const response = await fetch(`${BASE_URL}/user-upload-profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Ne pas inclure Content-Type ici
            },
            credentials: 'include', // Inclure les cookies si nécessaire
            body: formData
        });
        
        if (!response.ok) {
            // Handle specific error for permissions
            if (response.status === 403) {
                console.error('Permission error detected on server');
                throw new Error('Upload failed: The server does not have permission to store this file');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload profile picture');
        }
        
        return await response.json();
    } catch (error) {
        // Log different types of errors for debugging
        if (error instanceof Error) {
            if (error.message.includes('Permission denied') || error.message.includes('permission')) {
                console.error('Server permission error: Please contact administrator to verify upload directory permissions');
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                console.error('Network error: Check your internet connection');
            } else {
                console.error('Error uploading profile picture:', error.message);
            }
        } else {
            console.error('Unknown error uploading profile picture');
        }
        throw error;
    }
}

// Uploader une bannière
export async function uploadBannerPicture(file: File) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const formData = new FormData();
        formData.append('bannerPicture', file);
        
        const response = await fetch(`${BASE_URL}/user-upload-banner-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload banner picture');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error uploading banner picture:', error);
        throw error;
    }
}
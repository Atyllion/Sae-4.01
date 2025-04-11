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

// Créer un post
export async function createPost(postData: { content: string; user?: string }) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found. Please log in to create a post.');
        }

        const userResponse = await fetchUserToken();
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        postData.user = userData.id; // Ensure the correct user ID is assigned

        const response = await fetch(`${BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });
        console.log("response", response);
        return response; // Ensure a valid Response object is returned
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
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

        if (!token) {
            throw new Error('No token found. Please log in to view your posts.');
        }

        const response = await fetch(`${BASE_URL}/posts/user/${userId}?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
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
        const response = await fetch(`${BASE_URL}/updateuser/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
        }

        return await response.json();
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

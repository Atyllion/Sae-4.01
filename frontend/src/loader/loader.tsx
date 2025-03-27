// filepath: /home/donzaud/SAE4.DWeb-DI.01-backend-master/frontend/src/loader/loader.tsx

const BASE_URL = 'http://localhost:8080';

export async function fetchPosts(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/posts?page=${page}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
            return await response.json();
        }
        return response;
    } catch (error) {
        console.error('Erreur lors du chargement des posts :', error);
        throw error;
    }
}

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

export async function fetchUsers() {
    try {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        throw error;
    }
}

export async function fetchUserById(userId: string) {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur :', error);
        throw error;
    }
}

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

export async function loginUser(userData: { email: string; password: string }) {
    console.log("userData", userData);

    try {
        const token = localStorage.getItem('token');

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

        console.log("response loader :", response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.error || 'Failed to log in user');
        }

        return response;
    } catch (error) {
        console.error('Erreur lors de la connexion de l\'utilisateur :', error);
        throw error;
    }
}

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
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération du token :', error);
        throw error;
    }
}

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
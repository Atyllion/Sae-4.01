import React, { useEffect, useState } from 'react';
import { fetchAllPosts } from '../../loader/loader';
import BackofficePostItem from '../Backoffice-Post-Item/Backoffice-Post-Item';
import BackButton from '../Button-Back/Button-Back';

export default function BackofficePosts() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        try {
            setLoading(true);
            const response = await fetchAllPosts();
            setPosts(response.posts);
        } catch (err) {
            setError('Erreur lors du chargement des posts');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredPosts = posts.filter(post => 
        !post.user.isBanned && 
        (post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-screen gap-4 px-2 sm:px-4 lg:px-8">
            <div className="bg-background/95 backdrop-blur-sm shadow-sm py-4 px-2 w-full transition-all duration-300">
                <BackButton />

                <h1 className="text-xl sm:text-2xl w-fit lg:text-3xl font-bold mb-2 text-center text-fg animate-fade-in">
                    Modération des posts
                </h1>

                <div className="relative w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Rechercher un post..."
                        className="mt-1 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto pb-4">
                {loading ? (
                    <p className="text-center text-fg mt-8">Chargement des posts...</p>
                ) : error ? (
                    <p className="text-center text-red-500 mt-8">{error}</p>
                ) : filteredPosts.length === 0 ? (
                    <p className="text-center text-fg mt-8">Aucun post trouvé</p>
                ) : (
                    <ul className="flex flex-col gap-4 px-2">
                        {filteredPosts.map((post) => (
                            <BackofficePostItem 
                                key={post.id} 
                                post={post} 
                                onUpdatePost={loadPosts}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
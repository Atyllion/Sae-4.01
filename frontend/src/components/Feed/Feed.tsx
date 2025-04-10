import React, { useCallback, useEffect, useRef, useState } from 'react';
import Post from '../../ui/Post/Post';
import { fetchPosts, fetchUserPosts } from '../../loader/loader';
import DynamicButton from '../../ui/Button-CTA/Button-CTA';

interface FeedProps {
    userId?: string;  // Optionnel: si fourni, affichera uniquement les posts de l'utilisateur
    title?: string;   // Titre optionnel pour le feed
}

export default function Feed({ userId, title }: FeedProps = {}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const observer = useRef(null);

    // Fonction pour observer le dernier post
    const lastPostRef = useCallback(
        (node) => {
            if (isFetching) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchMorePosts();
                }
            });
            if (node) observer.current.observe(node);
        },
        [hasMore, isFetching]
    );

    // Fonction pour charger plus de posts
    const fetchMorePosts = useCallback(async () => {
        if (!hasMore || isFetching) return;

        setIsFetching(true);
        try {
            let data;

            if (userId) {
                // Chargement des posts de l'utilisateur spécifié
                data = await fetchUserPosts(userId, page);
            } else {
                // Chargement de tous les posts
                data = await fetchPosts(page);
            }

            if (data && data.posts && data.posts.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...data.posts]);
                setPage((prevPage) => prevPage + 1);
                setHasMore(data.next_page !== null);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des posts :', error);
        } finally {
            setIsFetching(false);
        }
    }, [page, hasMore, isFetching, userId]);

    // Chargement des posts initiaux
    const loadInitialPosts = async () => {
        try {
            setIsFetching(true);
            let data;

            if (userId) {
                // Chargement des posts de l'utilisateur spécifié
                data = await fetchUserPosts(userId);
            } else {
                // Chargement de tous les posts
                data = await fetchPosts();
            }

            if (data && data.posts) {
                setPosts(data.posts);
                setPage(data.next_page || 2);
                setHasMore(data.next_page !== null);
            } else {
                setPosts([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des posts initiaux :', error);
            setPosts([]);
            setHasMore(false);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        // Réinitialise l'état quand l'userId change
        setPosts([]);
        setPage(1);
        setHasMore(true);

        loadInitialPosts();
    }, [userId]);

    // Fonction pour recharger les posts
    const reloadFeed = useCallback(async () => {
        setIsFetching(true);
        try {
            let data;

            if (userId) {
                // Rechargement des posts de l'utilisateur spécifié
                data = await fetchUserPosts(userId);
            } else {
                // Rechargement de tous les posts
                data = await fetchPosts();
            }

            if (data && data.posts) {
                setPosts(data.posts);
                setPage(data.next_page || 2);
                setHasMore(data.next_page !== null);
            }
        } catch (error) {
            console.error('Erreur lors du rechargement des posts :', error);
        } finally {
            setIsFetching(false);
        }
    }, [userId]);

    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <>
            <div className='flex flex-col items-center justify-center my-4'>
                {title && <h2 className="text-xl font-semibold mt-6 mb-4">{title}</h2>}

                {/* bouton de rechargement des posts */}
                <DynamicButton
                    label="Recharger les posts"
                    onClick={reloadFeed}
                    variant="primary"
                    className="px-6 py-2 sticky font-semibold rounded-lg shadow-md transition-all duration-300 cursor-pointer active:scale-95"
                />

                <ul className='flex gap-8 flex-col items-center p-4 bg-transparent rounded-lg w-full my-2 list-none md:p-5'>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <Post
                                key={`${post.id}-${index}`}
                                content={post.content}
                                created_at={new Date(post.created_at).toISOString()}
                                id={post.id}
                                user={post.user}
                                media={post.media}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 my-8">
                            Pas encore de Post créer...
                        </p>
                    )}
                </ul>

                {hasMore && <div ref={lastPostRef} style={{ height: '1px' }}></div>}
                {isFetching && <p className="text-center mt-4">Chargement de plus de posts...</p>}
                {!hasMore && posts.length > 0 && (
                    <p className="text-center m-4 max-w-lg">
                        Vous avez atteint la fin, rechargez la page pour afficher plus de nouveaux posts.
                    </p>
                )}

            </div>
        </>
    );
}
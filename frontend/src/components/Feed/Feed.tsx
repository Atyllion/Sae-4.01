import React, { useCallback, useEffect, useRef, useState } from 'react';
import Post from '../../ui/Post/Post';
import { fetchPosts, fetchUserPosts } from '../../loader/loader';
import DynamicButton from '../../ui/Button-CTA/Button-CTA';

interface FeedProps {
    userId?: string;
    title?: string;
}

export default function Feed({ userId, title }: FeedProps = {}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const observer = useRef(null);
    const initialLoadDone = useRef(false);
    const initialLoadTimestamp = useRef(0); // Timestamp du chargement initial

    // Fonction pour observer le dernier post avec protection contre les déclenchements trop rapides
    const lastPostRef = useCallback(
        (node) => {
            if (isFetching) return;
            if (observer.current) observer.current.disconnect();
            
            observer.current = new IntersectionObserver((entries) => {
                // Ne déclencher le chargement que si:
                // 1. L'élément est visible
                // 2. Il y a plus de contenu à charger
                // 3. Au moins 1 seconde s'est écoulée depuis le chargement initial
                const now = Date.now();
                const timeSinceInitialLoad = now - initialLoadTimestamp.current;
                
                if (entries[0].isIntersecting && hasMore && timeSinceInitialLoad > 1000) {
                    console.log("Intersection détectée, chargement de plus de posts...");
                    fetchMorePosts();
                } else if (entries[0].isIntersecting) {
                    console.log("Intersection détectée, mais ignore car trop tôt après chargement initial.");
                }
            });
            
            if (node) observer.current.observe(node);
        },
        [hasMore, isFetching]
    );

    // Fonction pour charger plus de posts
    const fetchMorePosts = useCallback(async () => {
        if (!hasMore || isFetching || !initialLoadDone.current) return;

        console.log("Démarrage du chargement de posts supplémentaires, page:", page);
        setIsFetching(true);
        
        try {
            let data;

            if (userId) {
                data = await fetchUserPosts(userId, page);
            } else {
                data = await fetchPosts(page);
            }

            console.log('Nouvelles données récupérées:', data);

            if (data && data.posts && data.posts.length > 0) {
                // Vérifier qu'on n'ajoute pas de doublons
                const existingIds = new Set(posts.map(post => post.id));
                const uniqueNewPosts = data.posts.filter(post => !existingIds.has(post.id));
                
                console.log("Posts récupérés:", data.posts.length, "Posts uniques:", uniqueNewPosts.length);
                
                if (uniqueNewPosts.length > 0) {
                    setPosts((prevPosts) => [...prevPosts, ...uniqueNewPosts]);
                }
                
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
    }, [page, hasMore, isFetching, userId, posts]);

    // Chargement des posts initiaux
    const loadInitialPosts = useCallback(async () => {
        // Empêcher double chargement
        if (initialLoadDone.current) return;
        
        console.log("Démarrage du chargement initial des posts");
        setIsFetching(true);
        
        try {
            let data;

            if (userId) {
                data = await fetchUserPosts(userId);
            } else {
                data = await fetchPosts();
            }

            console.log("Posts initiaux récupérés:", data?.posts?.length);

            if (data && data.posts) {
                // S'assurer que posts est un tableau unique
                const uniquePosts = Array.from(
                    new Map(data.posts.map(post => [post.id, post])).values()
                );
                
                setPosts(uniquePosts);
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
            initialLoadDone.current = true;
            initialLoadTimestamp.current = Date.now(); // Enregistrer le timestamp du chargement initial
        }
    }, [userId]);

    useEffect(() => {
        // Réinitialiser l'état quand l'userId change
        setPosts([]);
        setPage(1);
        setHasMore(true);
        initialLoadDone.current = false;

        loadInitialPosts();
        
        // Effet de cleanup
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [userId, loadInitialPosts]);

    // Reste du code inchangé...

    return (
        <>
            <div className='flex flex-col items-center justify-center my-4'>
                {title && <h2 className="text-xl font-semibold mt-6 mb-4">{title}</h2>}

                {/* bouton de rechargement des posts */}
                <DynamicButton
                    label="Recharger les posts"
                    onClick={() => {
                        initialLoadDone.current = false;
                        loadInitialPosts();
                    }}
                    variant="primary"
                    className="px-6 py-2 sticky font-semibold rounded-lg shadow-md transition-all duration-300 cursor-pointer active:scale-95"
                />

                <ul className='flex gap-8 flex-col items-center p-4 bg-transparent rounded-lg w-full my-2 list-none md:p-5'>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Post
                                key={post.id}
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

                {/* Div invisible pour déclencher le chargement de plus de posts */}
                {hasMore && posts.length > 0 && <div ref={lastPostRef} style={{ height: '20px' }}></div>}
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
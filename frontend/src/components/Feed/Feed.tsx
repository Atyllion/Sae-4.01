import React, { useCallback, useEffect, useRef, useState } from 'react';
import Post from '../../ui/Post/Post';
import { fetchPosts, fetchInitialPosts } from '../../loader/loader';
import { fetchAllTokens } from '../../loader/loader';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const observer = useRef(null);

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

    const fetchMorePosts = useCallback(async () => {
        if (!hasMore || isFetching) return;

        setIsFetching(true);
        try {
            const data = await fetchPosts(page);

            if (data.posts.length > 0) {
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
    }, [page, hasMore, isFetching]);

    useEffect(() => {
        const loadInitialPosts = async () => {
            try {
                const data = await fetchInitialPosts();
                setPosts(data.posts);
                setPage(data.next_page);
                setHasMore(data.next_page !== null);
            } catch (error) {
                console.error('Erreur lors du chargement des posts initiaux :', error);
            }
        };

        if (posts.length === 0) {
            loadInitialPosts();
        }
    }, [posts.length]);

    return (
        <>
            <div className='flex flex-col items-center justify-center'> 
                <ul className='flex gap-8 flex-col items-center p-4 bg-transparent rounded-lg w-full my-2 list-none md:p-5'>
                    {posts.map((post, index) => (
                        <Post key={`${post.id}-${index}`} content={post.content} created_at={new Date(post.created_at).toISOString()} user={post.user} />
                    ))}
                </ul>
                {hasMore && <div ref={lastPostRef} style={{ height: '1px' }}></div>}
                {isFetching && <p className="text-center mt-4">Chargement de plus de posts...</p>}
                {!hasMore && posts.length > 0 && (
                    <p className="text-center m-4 max-w-lg">
                        Vous avez atteint la fin, recharcher la page pour afficher plus de noueaux posts.
                    </p>
                )}
            </div>
        </>
    );
}

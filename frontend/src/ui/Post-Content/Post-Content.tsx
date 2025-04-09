import React from 'react';
import PostMedia from '../Post-Media/Post-Media';

interface PostContentProps {
    content: string;
    media?: string[];
    isCensored?: boolean;
}

const PostContent: React.FC<PostContentProps> = ({ content, media = [], isCensored = false }) => {
    return (
        <>
            {/* Contenu textuel du post */}
            <p className={`text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose ${isCensored ? 'italic text-gray-500' : ''}`}>
                {content}
            </p>

            {/* Affichage des médias seulement si le post n'est pas censuré */}
            {!isCensored && media && media.length > 0 && (
                <PostMedia media={media} />
            )}
        </>
    );
};

export default PostContent;
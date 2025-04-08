import React from 'react';
import PostMedia from '../Post-Media/Post-Media';

interface PostContentProps {
    content: string;
    media?: string[];
}

const PostContent: React.FC<PostContentProps> = ({ content, media = [] }) => {
    return (
        <>
            {/* Contenu textuel du post */}
            <p className='text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose'>{content}</p>

            {/* Affichage des médias */}
            {media && media.length > 0 && (
                <PostMedia media={media} />
            )}
        </>
    );
};

export default PostContent;
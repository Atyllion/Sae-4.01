import React from 'react';
import { getPostMediaUrl } from '../../loader/loader';

interface PostMediaProps {
    media: string[];
    postId?: string;  // Optionnel, utilisé pour les alt text
}

const PostMedia: React.FC<PostMediaProps> = ({ media, postId = '' }) => {
    return (
        <div className={`grid gap-2 my-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {media.map((mediaPath, index) => {
                const mediaUrl = getPostMediaUrl(mediaPath);
                if (!mediaUrl) return null;

                // Déterminer si c'est une vidéo ou une image
                const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);

                return (
                    <div key={index} className="rounded-md overflow-hidden">
                        {isVideo ? (
                            <video
                                src={mediaUrl}
                                controls
                                className="w-full max-h-80 object-cover"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt={`Media ${index} for post ${postId}`}
                                className="w-full max-h-80 object-cover"
                                loading="lazy"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PostMedia;
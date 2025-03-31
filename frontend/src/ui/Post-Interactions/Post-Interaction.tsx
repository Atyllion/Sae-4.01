import React from "react";
import PostLikes from "../Post-Likes/Post-Likes";

interface PostInteractionProps {
    postId: string;
}

export default function PostInteraction({ postId }: PostInteractionProps) {
    return (
        <div className="flex flex-row items-center gap-4 mt-3 border-t pt-2 border-gray-200">
            <PostLikes postId={postId} />
            {/* Ajoutez d'autres interactions ici si nécessaire, comme les commentaires */}
        </div>
    )
}
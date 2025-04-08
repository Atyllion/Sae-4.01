import React from "react";
import PostLikes from "../Post-Likes/Post-Likes";
import ReplyButton from "../Post-Reply/Post-Reply";

interface PostInteractionProps {
    postId: string;
    repliesCount: number;
    showReplies: boolean;
    onToggleReplies: () => void;
}

export default function PostInteraction({ 
    postId, 
    repliesCount, 
    showReplies, 
    onToggleReplies 
}: PostInteractionProps) {
    return (
        <div className="flex flex-row items-center gap-4">
            <PostLikes postId={postId} />
            <ReplyButton 
                postId={postId} 
                repliesCount={repliesCount} 
                showReplies={showReplies}
                onToggleReplies={onToggleReplies}
            />
        </div>
    )
}
import React, { useState, useEffect } from "react";
import { fetchReplyCount } from "../../loader/loader";

interface ReplyButtonProps {
    postId: string;
    showReplies: boolean;
    onToggleReplies: () => void;
    repliesCount?: number; // Made optional since we'll fetch it dynamically
}

export default function ReplyButton({
    postId,
    showReplies,
    onToggleReplies,
    repliesCount: initialRepliesCount
}: ReplyButtonProps) {
    const [repliesCount, setRepliesCount] = useState(initialRepliesCount || 0);
    
    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const count = await fetchReplyCount(postId);
                setRepliesCount(count);
            } catch (error) {
                console.error("Error fetching reply count:", error);
            }
        };
        
        fetchReplies();
    }, [postId]);
    
    return (
        <button
            onClick={onToggleReplies}
            className="group flex flex-row items-center space-x-1 text-gray-500 transition-transform duration-200 gap-2 mt-3 cursor-pointer active:scale-95"
            title={showReplies ? "Masquer les réponses" : "Répondre et voir les réponses"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>

            <span className="text-sm font-medium text-gray-600">{repliesCount} {repliesCount === 1 ? 'réponse' : 'réponses'}</span>
        </button>
    );
}
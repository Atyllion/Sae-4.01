import React from 'react';

export default function Post({ content, created_at, user }: { content: string; created_at: string; user: { id: number; username: string } }) {
    return (
        <li className='flex flex-col list-none w-[90%] p-5 border border-gray-300 rounded-md bg-fg hover:shadow-md hover:bg-fg md:m-2.5 md:p-4 md:rounded-lg md:hover:shadow-lg gap-4'>
            <p className='text-bg font-bold text-lg max-w-4'>{user?.username || 'Unknown User'}</p>
            <p className='text-sm text-gray-800 leading-relaxed break-words md:text-base md:leading-loose'>{content}</p>
            <p className='text-gray-500 text-xs italic'>
            {new Date(created_at).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}
            </p>
        </li>
    );
}
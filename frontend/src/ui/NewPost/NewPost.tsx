
import React, { useState } from 'react';
import { createPost } from '../../loader/loader'; // Importez la fonction appropriée

export default function NewPost() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const maxCharacters = 280;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= maxCharacters) {
            setContent(input);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center bg-[var(--bg-color)] rounded-lg p-4 w-full md:w-full">
            <h1 className="text-2xl md:text-4xl leading-tight md:leading-snug">Create a New Post</h1>
            <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                try {
                const token = localStorage.getItem('token');

                if (!token) {
                    alert('No user is currently logged in. Please log in to create a post.');
                    return;
                }

                const response = await createPost({ content: content.trim(), user: token }); // Utilisez le token comme identifiant utilisateur

                if (response.ok) {
                    console.log('Post created successfully'); // Log the success
                    setPosts([...posts, { content }]); // Update the posts
                    setContent(''); // Reset the content
                    alert('Post created successfully !'); // Notify the user
                } else {
                    const errorData = await response.json();
                    console.error('Error creating post:', errorData.errors.join(', '));
                    alert(`Error creating post: ${errorData.errors.join(', ')}`); // Notify the user
                }

                } catch (error) {
                console.error('An error occurred while creating the post:', error); // Log the actual error
                alert('An unexpected error occurred. Please try again later.'); // Notify the user with a generic message
                }
            }}>
                <textarea
                autoComplete="true"
                placeholder="What do you have in mind? max 280 characters"
                className="text-base leading-relaxed text-left w-full h-40 resize-none p-2 my-4 border border-[var(--border-color)] rounded-md"
                id="post_text_content"
                name="content"
                rows={4}
                cols={50}
                value={content}
                onChange={handleContentChange}
                required
                ></textarea>
                <div className="text-sm text-gray-500">
                {maxCharacters - content.length} characters remaining
                </div>
                <br /><br />
                <button
                id="NewPostButton"
                className="rounded-lg border border-transparent py-4 px-0 text-sm font-medium bg-[var(--color-fg)] text-[var(--color-bg)] cursor-pointer w-full transition-colors duration-200 hover:border-[var(--primary-color)] focus:outline-4 focus:outline-webkit-focus-ring-color"
                type="submit"
                >
                Create Post
                </button>
            </form>
            </div>
        </>
    );
}

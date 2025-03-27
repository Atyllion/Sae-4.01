import './NewPost.css';
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
            <div className='NewPost'>
                <h1 className='NewPost__title'>Create a New Post</h1>
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
                        autoComplete='true'
                        placeholder='What do you have in mind? max 280 characters'
                        className='NewPost__textarea'
                        id="post_text_content"
                        name="content"
                        rows={4}
                        cols={50}
                        value={content}
                        onChange={handleContentChange}
                        required
                    ></textarea>
                    <div className="NewPost__counter">
                        {maxCharacters - content.length} characters remaining
                    </div>
                    <br /><br />
                    <button
                        id='NewPostButton'
                        className='NewPost__Button'
                        type="submit"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </>
    );
}

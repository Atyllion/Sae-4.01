import './NewPost.css';

export default function NewPost() {
    return (
        <>
            <div className='NewPost'>
                <h1 className='NewPost__title'>Create a New Post</h1>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const content = e.target.content.value;

                    try {
                        const response = await fetch('http://localhost:8080/posts', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ content }),
                        });

                        if (response.ok) {
                            console.log('Post created successfully');
                            e.target.reset(); // Reset the form
                            alert('Post created successfully!'); // Notify the user
                        } else {
                            const error = await response.json();
                            console.error('Error creating post:', error.message || error);
                            alert(`Error creating post: ${error.message || 'Unknown error'}`); // Notify the user
                        }
                    } catch (error) {
                        alert('Text exceed 280 characters, please try again'); // Notify the user
                    }

                }}>
                    <textarea autoComplete='true' placeholder='What do you have in mind ? max 280 characters' className='NewPost__textarea' id="post_text_content" name="text__content" rows="4" cols="50" required></textarea><br /><br />
                    <button className='NewPost__Button' type="submit">Create Post</button>
                </form>
            </div>
        </>
    )
}
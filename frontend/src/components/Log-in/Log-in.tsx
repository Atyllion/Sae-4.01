// Import UI
import LogInForm from '../../ui/Log-in-Form/Log-in-Form';
import { fetchUsers } from '../../loader/loader';
import BackButton from '../../ui/Button-Back/Button-Back';

// Import Component
import React, { useState, useEffect } from 'react';

export default function Login() {
    const [user, setUser] = useState({ isBanned: false });

    useEffect(() => {
        fetchUsers().then((users) => {
            if (users && users.length > 0) {
                setUser(users[0]); // Set the first user or modify as needed
            }
        }).catch((error) => {
            console.error('Error fetching users:', error);
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-between h-screen p-6 rounded-md">

            <BackButton />

            <div className='flex flex-col gap-4 p-4 rounded-md justify-center min-w-50 w-full md:w-1/2 h-screen'>

                <h1 className="text-6xl text-center font-bold fg-fg mt-6">Log in</h1>
                <div className="flex-grow flex items-center justify-center">
                    <LogInForm />
                </div>
                <div className="text-center mb-6 flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-600">Don't have an account?</p>
                    <a
                        href="/signin"
                        className="text-fg hover:text-bg underline transition-colors duration-200"
                    >
                        Sign In
                    </a>
                </div>
            </div>

        </div>
    );
}
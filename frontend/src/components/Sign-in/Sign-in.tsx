// Import UI
import SignInForm from '../../ui/Sign-in-Form/Sign-in-Form';
import BackButton from '../../ui/Button-Back/Button-Back';

// Import Component
import React from 'react';
import { Link } from "react-router-dom";

export default function Signin() {
    return (
        <div className="flex flex-col items-center justify-between h-screen p-6 rounded-md">
            
            <BackButton />

            <div className='flex flex-col gap-4 p-4 rounded-md justify-center min-w-50 w-full md:w-1/2 h-screen'>
                <h1 className="text-6xl text-center font-bold fg-fg mt-6">Sign in</h1>
                <div className="flex-grow flex items-center justify-center">
                    <SignInForm />
                </div>
                <div className="text-center mb-6 flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-600">Already have an account?</p>
                    <Link
                        to="/login"
                        className="text-fg hover:text-bg underline transition-colors duration-200"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
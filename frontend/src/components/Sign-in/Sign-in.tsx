// Import UI
import SignInForm from '../../ui/Sign-in-Form/Sign-in-Form';

// Import Component
import React from 'react';

export default function Signin() {
    return (
        <div className="flex flex-col items-center justify-between h-screen p-6 rounded-md">
            <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded mt-4 md:mt-0 md:absolute md:left-4 self-start md:self-auto"
            >
                Retour
            </button>

            <div className='flex flex-col gap-4 p-4 rounded-md justify-center min-w-50 w-full md:w-1/2 h-screen'>
                <h1 className="text-6xl text-center font-bold fg-fg mt-6">Sign in</h1>
                <div className="flex-grow flex items-center justify-center">
                    <SignInForm />
                </div>
                <div className="text-center mb-6 flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-600">Already have an account?</p>
                    <a
                        href="/login"
                        className="text-fg hover:text-bg underline transition-colors duration-200"
                    >
                        Log in
                    </a>
                </div>
            </div>
        </div>
    );
}
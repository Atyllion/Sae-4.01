import React from "react";

export default function BackofficeAccess() {
    function handleCLickOnBackoffice() {
        window.location.href = '/backoffice';
    }

    return (
        <>
            <li className="Backoffice-section">
                <button onClick={handleCLickOnBackoffice} className='bg-fg rounded-4xl p-2 text-bg cursor-pointer'>
                    <img className='max-w-10 max-h-10 aspect-square cursor-pointer' src="/assets/backoffice-Access.svg" alt='Backoffice-svg'></img>
                </button>
            </li>
        </>
    )
}
import React from 'react';

export default function NavBarHome() {
    function handleCLickOnHome() {
        window.location.href = '/';
    }

    return (
        <>
            <li className="Home-section">
                <button onClick={handleCLickOnHome} className='bg-fg md:scale-120 rounded-4xl p-2 text-bg cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out transform'>
                    <img className='max-w-10 max-h-10 aspect-square cursor-pointer' src="/assets/home.svg" alt='Home-svg' title="Accueil" ></img>
                </button>
            </li>
        </>
    )
}
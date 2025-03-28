import React from 'react';

// UI
import NavBarProfile from '../../ui/NavBar-Profile/NavBar-Profile';
import NavBarHome from '../../ui/NavBar-Home/NavBar-Home';
import NavBarBackoffice from '../../ui/NavBar-Backoffice/NavBar-Backoffice';

interface NavBarProps {
    isAdmin: boolean;
}

export default function NavBar({ isAdmin }: NavBarProps) {
    return (
        <>
            <div className="w-full bg-fg text-bg md:h-screen md:top-0 md:w-fit sticky bottom-0 md:sticky md:flex-shrink-0 md:ml-auto ">
                <ul className="flex justify-around items-center md:flex-col md:items-center md:h-full md:space-y-4 p-4">
                    <NavBarHome />
                    {isAdmin && <NavBarBackoffice />}
                    <NavBarProfile />
                </ul>
            </div>
        </>
    );
}
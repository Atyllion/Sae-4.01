import React from 'react';

// UI
import NavBarProfile from '../../ui/NavBar-Profile/NavBar-Profile';
import NavBarHome from '../../ui/NavBar-Home/NavBar-Home';

export default function NavBar() {

    return (
        <>
            <div className="w-full bg-fg text-bg md:w-auto md:h-screen md:top-0 md:sticky md:bottom-auto sticky bottom-0">
                <ul className="flex justify-around items-center md:flex-col md:items-end md:h-full md:space-y-4 p-4">
                    <NavBarHome />
                    <NavBarProfile />
                </ul>
            </div>
        </>
    )

}
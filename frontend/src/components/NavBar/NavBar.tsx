import React from 'react';

// UI
import NavBarProfile from '../../ui/NavBar-Profile/NavBar-Profile';
import NavBarHome from '../../ui/NavBar-Home/NavBar-Home';

export default function NavBar() {

    return (
        <>
            <div className="w-full bg-fg text-bg md:h-screen md:top-0 md:w-fit sticky bottom-0 md:sticky md:flex-shrink-0 md:ml-auto">
                <ul className="flex justify-around items-center md:flex-col md:items-start md:h-full md:space-y-4 p-4">
                    <NavBarHome />
                    <NavBarProfile />
                </ul>
            </div>
        </>
    )

}
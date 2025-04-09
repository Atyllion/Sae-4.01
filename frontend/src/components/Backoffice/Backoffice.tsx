// UI components
import BackofficeUsers from '../../ui/Backoffice-Users/Backoffice-Users';
import BackofficePosts from '../../ui/Backoffice-Posts/Backoffice-Posts';

// Components
import React from 'react';

export default function Backoffice() {
    return (
        <>
            <div className='flex flex-col h-full w-full gap-4'>
                <BackofficePosts />
                <BackofficeUsers />
            </div>
        </>
    );
}
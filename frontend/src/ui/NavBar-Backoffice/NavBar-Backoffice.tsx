import React from "react";
import DynamicButton from '../Button-CTA/Button-CTA';

export default function BackofficeAccess() {
    function handleCLickOnBackoffice() {
        window.location.href = '/backoffice';
    }

    return (
        <>
            <li className="Backoffice-section">
                <DynamicButton
                    onClick={handleCLickOnBackoffice}
                    variant="secondary"
                    size='medium'
                    label=""
                    className="bg-fg rounded-4xl md:scale-120 p-2 text-bg hover:shadow-lg transition-all duration-300 ease-in-out transform"
                    icon={<img className='max-w-10 max-h-10 aspect-square cursor-pointer' src="/assets/backoffice-Access.svg" alt='Backoffice-svg' title="Acces au BackOffice" />}
                />
            </li>
        </>
    )
}
import React from 'react';
import DynamicButton from '../Button-CTA/Button-CTA';
import { useNavigate } from 'react-router-dom';
import UrlFront from '../../loader/Url-Front/Url-Front';

export default function NavBarHome() {
    const navigate = useNavigate();
    
    function handleCLickOnHome() {
        navigate('/');
    }

    return (
        <>
            <li className="Home-section">
                <DynamicButton
                    onClick={handleCLickOnHome}
                    variant="secondary"
                    size='medium'
                    label=""
                    className="bg-fg md:scale-120 rounded-4xl justify-center align-middle items-center p-2 text-bg hover:shadow-lg transition-all duration-300 ease-in-out transform"
                    icon={<img className='max-w-10 max-h-10 cursor-pointer' src={`${UrlFront()}/assets/home.svg`} alt='Home-svg' title="Accueil" />}
                />
            </li>
        </>
    )
}
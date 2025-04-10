import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
type ButtonSize = 'small' | 'medium' | 'large';

interface DynamicButtonProps {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function DynamicButton({
    label,
    onClick,
    variant = 'primary',
    size = 'medium',
    icon,
    isLoading = false,
    disabled = false,
    className = ''
}: DynamicButtonProps) {
    // Classes de base pour tous les boutons
    const baseClasses = "font-medium rounded focus:outline-none transition-all duration-200 flex items-center justify-center";
    
    // Classes spécifiques à la variante
    const variantClasses = {
        primary: "bg-blue-500 hover:bg-blue-600 text-white active:scale-95",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 active:scale-95",
        success: "bg-green-500 hover:bg-green-600 text-white active:scale-95",
        danger: "bg-red-500 hover:bg-red-600 text-white active:scale-95",
        warning: "bg-yellow-500 hover:bg-yellow-600 text-white active:scale-95"
    };
    
    // Classes spécifiques à la taille
    const sizeClasses = {
        small: "text-xs px-2 py-1",
        medium: "text-sm px-4 py-2",
        large: "text-base px-6 py-3"
    };
    
    // Classes pour l'état désactivé ou chargement
    const stateClasses = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    
    // Composition de toutes les classes
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${className}`;
    
    return (
        <button
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {label}
        </button>
    );
}
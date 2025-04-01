import React from "react";

export default function BackButton() {
    return (
        <>
            {/*retour à la page d'accueil*/}
            <button
                onClick={() => window.history.back()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded mt-4 md:mt-0 self-start mb-4 cursor-pointer shadow-sm transition-all duration-200 active:scale-90"
                id='back-button'
                title="Retour à la page précédente"
            >
                Retour
            </button>
        </>
    );
}
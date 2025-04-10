import React from "react";
import DynamicButton from '../Button-CTA/Button-CTA';

export default function BackButton() {
    return (
        <>
            {/* retour en arrière */}
            <DynamicButton
                label="Retour"
                onClick={() => window.history.back()}
                variant="secondary"
                className="self-start mb-4"
                size="medium"
            />
        </>
    );
}
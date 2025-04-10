import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { signInUser } from '../../loader/loader';
import DynamicButton from '../Button-CTA/Button-CTA';

// Composant principal du formulaire de connexion
export default function SignInForm() {
    // État pour stocker les données du formulaire
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // État pour stocker les erreurs de validation
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
    });

    // État pour stocker le score de force du mot de passe
    const [passwordScore, setPasswordScore] = useState(0);

    // Fonction pour valider l'email
    const validateEmail = (email: string) => {
        if (!email.includes('@')) return 'Email must contain @.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format.';
        return '';
    };

    // Fonction pour valider le mot de passe
    const validatePassword = (password: string) => {
        if (password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
        return '';
    };

    // Fonction pour gérer les changements dans les champs du formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validation dynamique des champs
        if (name === 'email') {
            setErrors({ ...errors, email: validateEmail(value) });
        } else if (name === 'password') {
            setErrors({ ...errors, password: validatePassword(value) });

            // Mise à jour du score de force du mot de passe
            const result = zxcvbn(value);
            setPasswordScore(result.score);
        } else if (name === 'username') {
            setErrors({ ...errors, username: value ? '' : 'Username is required.' });
        }
    };

    // Vérifie si le formulaire est valide
    const isFormValid = () => {
        return (
            !errors.username &&
            !errors.email &&
            !errors.password &&
            formData.username &&
            formData.email &&
            formData.password
        );
    };

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isFormValid()) return;

        try {
            const response = await signInUser(formData);
            alert('User created successfully !');
            setFormData({ username: '', email: '', password: '' }); // Réinitialisation du formulaire
            setErrors({ username: '', email: '', password: '' }); // Réinitialisation des erreurs
            setPasswordScore(0); // Réinitialisation du score de mot de passe
        } catch (error: any) {
            alert(error.message || 'An error occurred. Please try again.');
        }
    };

    // Fonction pour obtenir la couleur correspondant au score de force du mot de passe
    const getStrengthColor = (score: number) => {
        switch (score) {
            case 0:
                return 'red';
            case 1:
                return 'orange';
            case 2:
                return 'yellow';
            case 3:
                return 'lightgreen';
            case 4:
                return 'green';
            default:
                return 'gray';
        }
    };

    return (
        <form
            className="flex flex-col gap-4 p-4 rounded-md w-full"
            onSubmit={handleSubmit}
        >
            {/* Champ pour le nom d'utilisateur */}
            <label className="flex flex-col">
                Username
                <input
                    required
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`p-2 rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black`}
                />
                {errors.username && (
                    <span className="text-red-500 text-sm">{errors.username}</span>
                )}
            </label>

            {/* Champ pour l'email */}
            <label className="flex flex-col">
                Email
                <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`p-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black`}
                />
                {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                )}
            </label>

            {/* Champ pour le mot de passe */}
            <label className="flex flex-col">
                Password
                <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`p-2 rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.password && (
                    <span className="text-red-500 text-sm">{errors.password}</span>
                )}
            </label>

            {/* Visualisateur de force du mot de passe */}
            <div className="mt-2">
                <div
                    style={{
                        height: '10px',
                        width: '100%',
                        backgroundColor: getStrengthColor(passwordScore),
                    }}
                />
                <p className="text-sm mt-1">
                    Password strength : {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordScore]}
                </p>
            </div>

            {/* Bouton de soumission */}
            <DynamicButton
                label="Sign In"
                onClick={() => { }} // Le formulaire gère déjà la soumission
                variant="primary"
                disabled={!isFormValid()}
                className={`w-full ${!isFormValid() ? 'opacity-50' : ''}`}
            />
        </form>
    );
}

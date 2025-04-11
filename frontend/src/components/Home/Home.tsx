import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { fetchUserToken } from '../../loader/loader';

// importer UI
import NewPost from '../../ui/NewPost/NewPost';

// importer Component
import Feed from '../Feed/Feed';
import NavBar from '../NavBar/NavBar';
import Login from '../Log-in/Log-in';
import Signin from '../Sign-in/Sign-in';
import Backoffice from '../Backoffice/Backoffice';
import Profil from '../Profil/Profil';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Gère l'authentification
  const [isVerified, setIsVerified] = useState(false); // Gère la vérification de l'utilisateur
  const [userAdmin, setUserAdmin] = useState(null); // null au départ pour différencier l'état de chargement

  // Gestion des données utilisateur après récupération du token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token détecté :', token);

    if (token) {
      fetchUserToken()
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Échec de la récupération des données utilisateur');
        })
        .then((data) => {
          console.log('Données utilisateur récupérées :', data);

          setIsAuthenticated(true); // Marque l'utilisateur comme authentifié
          setIsVerified(data.user.isVerified); // Vérifie si le compte est validé
          console.log('Utilisateur vérifié ?', data.user.isVerified);

          // Vérifie les rôles pour voir si l'utilisateur est admin
          const roles = data.user.roles;
          if (roles.includes('ROLE_ADMIN')) {
            setUserAdmin(true);
            console.log('L’utilisateur est admin.');
          } else {
            setUserAdmin(false);
            console.log('L’utilisateur n’est pas admin.');
          }
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des données utilisateur :', error);
        });
    } else {
      console.log('Aucun token détecté, utilisateur non authentifié.');
      setIsAuthenticated(false);
      setIsVerified(false);
      setUserAdmin(false);
    }
  }, []);

  // Pendant le chargement, affiche un indicateur
  if (userAdmin === null) {
    return <div>Chargement des données utilisateur...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Route principale */}
        <Route
          path="/"
          element={
            <>
              <div className="flex flex-col md:flex-row">
                <div className='flex flex-col w-full md:w-8/10'>
                  {isVerified ? (
                    <NewPost />
                  ) : (
                    <p className="text-center text-red-500 font-semibold mt-4">
                      Votre compte n'est pas vérifié. Vous ne pouvez pas publier.
                    </p>
                  )}
                  <Feed />
                </div>
                <NavBar isAdmin={userAdmin} />
              </div>
            </>
          }
        />

        {/* Pages de connexion et d'inscription */}
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />

        {/* profile utilisateur */}
        <Route path="/profil" element={<Profil />} />
        {/* profil d'un utilisateur spécifique */}
        <Route path="/user/:userId" element={<Profil />} />

        {/* Route pour le backoffice */}
        <Route
          path="/backoffice"
          element={
            userAdmin ? (
              <Backoffice />
            ) : (
              <Navigate to="/access-denied" replace />
            )
          }
        />

        {/* Page d'accès refusé */}
        <Route
          path="/access-denied"
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
              <h1 className="text-4xl font-bold text-red-500 mb-4">Accès refusé</h1>
              <p className="text-lg text-gray-700 mb-6">
                Vous n'avez pas la permission de consulter cette page.
              </p>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Retourner à l'accueil
              </button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate
} from "react-router-dom";
import { fetchUserToken } from "../../loader/loader";
import getRouterBasename from "../../loader/RouterBaseName/RouterBaseName";

// importer UI
import NewPost from "../../ui/NewPost/NewPost";
import Param from "../Param/Param";

// importer Component
import Feed from "../Feed/Feed";
import NavBar from "../NavBar/NavBar";
import Login from "../Log-in/Log-in";
import Signin from "../Sign-in/Sign-in";
import Backoffice from "../Backoffice/Backoffice";
import Profil from "../Profil/Profil";
import BlockedUsers from "../BlockedUsers/BlockedUsers";
import AccessDenied from "../../ui/AccessDenied/AccessDenied";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userAdmin, setUserAdmin] = useState(null);

  // Gestion des données utilisateur après récupération du token
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token détecté :", token);

    if (token) {
      fetchUserToken()
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Échec de la récupération des données utilisateur");
        })
        .then((data) => {
          console.log("Données utilisateur récupérées :", data);

          setIsAuthenticated(true);
          setIsVerified(data.user.isVerified);
          console.log("Utilisateur vérifié ?", data.user.isVerified);

          // Vérifie les rôles pour voir si l'utilisateur est admin
          const roles = data.user.roles;
          if (roles.includes("ROLE_ADMIN")) {
            setUserAdmin(true);
            console.log("L'utilisateur est admin.");
          } else {
            setUserAdmin(false);
            console.log("L'utilisateur n'est pas admin.");
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des données utilisateur :",
            error
          );
        });
    } else {
      console.log("Aucun token détecté, utilisateur non authentifié.");
      setIsAuthenticated(false);
      setIsVerified(false);
      setUserAdmin(false);
    }
  }, []);

  // Pendant le chargement, affiche un indicateur
  if (userAdmin === null) {
    return <div>Chargement des données utilisateur...</div>;
  }

  // Utiliser le basename correct pour le Router
  const basename = getRouterBasename();
  
  return (
    <Router basename={basename}>
      <Routes>
        {/* Routes inchangées */}
        <Route
          path="/"
          element={
            <>
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col w-full md:w-8/10">
                  {isVerified ? (
                    <NewPost />
                  ) : (
                    <p className="text-center text-red-500 font-semibold mt-4">
                      Votre compte n'est pas vérifié. Vous ne pouvez pas
                      publier.
                    </p>
                  )}
                  <Feed />
                </div>
                <NavBar isAdmin={userAdmin} />
              </div>
            </>
          }
        />

        {/* Autres routes inchangées */}
        <Route path="/parametres" element={localStorage.getItem("token") ? (<Param />) : (<Navigate to="/login" replace />)} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/user/:userId" element={<Profil />} />
        <Route path="/backoffice" element={userAdmin ? (<><Backoffice /></>) : (<Navigate to="/access-denied" replace />)} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/blocked-users" element={<BlockedUsers />} />
      </Routes>
    </Router>
  );
}
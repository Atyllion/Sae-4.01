import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";
import DynamicButton from "../Button-CTA/Button-CTA";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Accès refusé</h1>
      <p className="text-lg text-gray-700 mb-6">
        Vous n'avez pas la permission de consulter cette page.
      </p>
      <DynamicButton
        onClick={() => navigate("/")}
        label="Retourner à l'accueil"
        variant="primary"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      />
    </div>
  );
};

export default AccessDenied;

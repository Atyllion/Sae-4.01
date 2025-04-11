export default function UrlFront() {
    // En production, utiliser la variable d'environnement
    // En développement, utiliser une chaîne vide (les assets sont servis depuis la racine)
    const BASE_URL = (import.meta as any).env.VITE_BASE_URL || "";
    
    return BASE_URL;
}
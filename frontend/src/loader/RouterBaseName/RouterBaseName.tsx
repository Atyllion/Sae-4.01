export default function getRouterBasename() {
  // En production, nous voulons uniquement le chemin relatif
  if ((import.meta as any).env.PROD) {
    return "/~donzaud2/Sae-4.01/Cycle-C/frontend";
  }

  // En développement, utilisez une chaîne vide comme basename
  return "";
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/~donzaud2/Sae-4.01/Cycle-C/frontend/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
   port: 5173,
   strictPort: true,
  },
  server: {
   port: 5173,
   strictPort: true,
   host: true,
   origin: "https://mmi.unilim.fr/~donzaud2/Sae-4.01/Cycle-C/frontend", // URL mise à jour
   allowedHosts: ["sae-frontend", "mmi.unilim.fr"]
  },
});
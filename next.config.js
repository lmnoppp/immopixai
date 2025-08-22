/** @type {import('next').NextConfig} */
const nextConfig = {
  // La configuration 'output: standalone' est utile pour les déploiements Docker.
  // Elle est conservée car elle est pertinente pour la production.
  output: 'standalone',
  
  // Toute autre configuration qui pourrait causer des conflits a été retirée.
  // Le système de build de Next.js avec l'App Router n'a généralement pas besoin
  // de configuration supplémentaire pour les fonctionnalités de base.
};

module.exports = nextConfig; 
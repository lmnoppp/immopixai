# ImmoPix AI - Guide de Déploiement

## 🚀 Plateforme de Déploiement

### Vercel (Recommandé)
- **URL de production** : https://immopix-azlaqsu4a-leos-projects-a64e53b8.vercel.app
- **Configuration** : Next.js 14 avec output standalone
- **Démarrage** : `node .next/standalone/server.js`
- **Build** : `npm run build`

### Configuration Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🔧 Variables d'Environnement

### Variables Requises
```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE=sb_secret_votre_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_votre_anon_key

# APIs Externes
REPLICATE_API_TOKEN=your_replicate_token
OPENAI_API_KEY=your_openai_key

# Configuration
NODE_ENV=production
```

### Configuration Vercel
1. **Dashboard Vercel** → Projet → Settings → Environment Variables
2. **Ajouter chaque variable** avec la valeur appropriée
3. **Redeploy** après ajout des variables

## 📦 Scripts de Build

### package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  
  images: {
    domains: ['replicate.delivery'],
    formats: ['image/webp', 'image/avif'],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
}
```

## 🔐 Sécurité

### Clés API Sécurisées
- **REPLICATE_API_TOKEN** : Clé pour Replicate AI
- **OPENAI_API_KEY** : Clé pour GPT-4o
- **SUPABASE_SERVICE_ROLE_KEY** : Clé admin Supabase
- **SUPABASE_ANON_KEY** : Clé publique Supabase

### Headers de Sécurité
- **X-Frame-Options** : DENY
- **X-Content-Type-Options** : nosniff
- **Referrer-Policy** : strict-origin-when-cross-origin
- **Cache-Control** : no-store pour les APIs

## 🗄️ Base de Données

### Supabase Configuration
- **URL** : https://tkioemqyfoqseacryiiu.supabase.co
- **Tables** : `usersmvp`, `blacklist`
- **Index** : Optimisés pour performance
- **RLS** : Politiques simplifiées

### Script de Setup
```sql
-- Voir context/setup_database.sql pour le script complet
-- Tables principales : usersmvp, blacklist
-- Index optimisés pour les requêtes fréquentes
```

## 📊 Monitoring

### Logs Vercel
- **Build logs** : Vercel Dashboard → Deployments
- **Runtime logs** : Vercel Dashboard → Functions
- **Error tracking** : Intégration automatique

### Métriques
- **Performance** : Core Web Vitals
- **Erreurs** : Taux de succès des APIs
- **Utilisation** : Sessions et crédits consommés

## 🔄 Déploiement Automatique

### GitHub Integration
1. **Connecter le repo** à Vercel
2. **Auto-deploy** sur push vers main
3. **Preview deployments** sur pull requests

### Variables d'Environnement
- **Production** : Variables dans Vercel Dashboard
- **Preview** : Variables héritées de production
- **Local** : Fichier `.env.local`

## 🛠️ Déploiement Manuel

### Build Local
```bash
# Installation
npm install

# Build
npm run build

# Test local
npm start
```

### Vercel CLI
```bash
# Installation
npm i -g vercel

# Login
vercel login

# Déploiement
vercel --prod
```

## 🔧 Optimisations

### Performance
- **Next.js 14** : App Router optimisé
- **Standalone output** : Déploiement autonome
- **Image optimization** : Formats WebP/AVIF
- **Compression** : Gzip automatique

### Sécurité
- **Variables d'environnement** : Clés API sécurisées
- **Headers de sécurité** : Protection contre attaques
- **Middleware** : Authentification robuste
- **Validation** : Multi-niveaux

## 📱 Configuration Mobile

### PWA (Optionnel)
```json
{
  "name": "ImmoPix AI",
  "short_name": "ImmoPix",
  "description": "Optimisation d'images immobilières avec IA",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0099FF",
  "background_color": "#F6F9FF"
}
```

### Responsive Design
- **Mobile-first** : Design adaptatif
- **Touch-friendly** : Boutons optimisés
- **Performance** : Chargement rapide

## 🚨 Troubleshooting

### Problèmes de Build
- **Node version** : Vérifier Node 18.x
- **Dépendances** : `npm install` complet
- **Variables d'environnement** : Toutes configurées
- **Cache** : Nettoyer `.next` si nécessaire

### Problèmes de Runtime
- **Logs Vercel** : Vérifier les erreurs
- **APIs externes** : Tester les clés
- **Base de données** : Vérifier la connexion Supabase
- **Middleware** : Vérifier l'authentification

### Problèmes de Performance
- **Images** : Optimisation et compression
- **Bundle size** : Analyse avec `@next/bundle-analyzer`
- **Caching** : Configuration appropriée
- **CDN** : Utilisation du CDN Vercel

## 📋 Checklist de Déploiement

### Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données Supabase prête
- [ ] Tests locaux passés
- [ ] Build local réussi

### Déploiement
- [ ] Push vers main branch
- [ ] Build Vercel réussi
- [ ] Variables d'environnement vérifiées
- [ ] Tests de production passés

### Post-déploiement
- [ ] URLs de production testées
- [ ] APIs fonctionnelles
- [ ] Authentification opérationnelle
- [ ] Monitoring configuré

## 🔄 Mises à Jour

### Processus de Mise à Jour
1. **Développement local** : Tests complets
2. **Push vers main** : Déclenchement auto-deploy
3. **Vérification** : Tests de production
4. **Monitoring** : Surveillance des métriques

### Rollback
- **Vercel Dashboard** : Déploiements précédents
- **Revert** : Retour à la version stable
- **Variables** : Vérification des configurations

## 📞 Support

### Contact
- **Email** : contact@immopix-ai.site
- **WhatsApp** : +33 695297985
- **Documentation** : Fichiers dans `/context`

### Debug
- **Logs Vercel** : Dashboard → Functions
- **Supabase** : Dashboard → Logs
- **APIs externes** : Respectives dashboards 
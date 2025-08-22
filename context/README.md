# ImmoPix AI - Documentation Technique

## 🎯 Vue d'ensemble

ImmoPix AI est une application web de traitement d'images immobilières utilisant l'intelligence artificielle. L'application permet aux utilisateurs d'optimiser leurs photos immobilières avec des prompts générés automatiquement via GPT-4o et un traitement d'images via Replicate AI.

## 🏗️ Architecture Technique

### Frontend
- **Framework** : Next.js 14 (App Router) avec output standalone
- **Language** : TypeScript
- **Styling** : Tailwind CSS avec classes personnalisées
- **État** : React Hooks (useState, useEffect, useRef)
- **Animations** : CSS personnalisées avec keyframes et transitions
- **Police** : Sora (Google Fonts)

### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Système de codes d'accès + sessions avec middleware
- **API** : Next.js API Routes avec validation robuste
- **IA** : OpenAI GPT-4o (analyse visuelle) + Replicate (traitement d'images)
- **Stockage** : Upload direct vers Replicate via base64 (optimisé pour la qualité)

### Sécurité
- **Blacklist** : Système de blocage automatique pour les utilisateurs de test
- **Validation** : Vérification des crédits côté serveur et middleware
- **Sessions** : Gestion sécurisée avec expiration 24h
- **Headers de sécurité** : X-Frame-Options, CSP, etc.
- **Variables d'environnement** : Clés API sécurisées (REPLICATE_API_TOKEN, etc.)

## 🎨 Design System

### Palette de Couleurs
- **Primary Blue** : #0099FF
- **Light Blue** : #F6F9FF
- **Medium Blue** : #EAF4FF
- **Dark Blue** : #d1e7f0
- **Accent Green** : #00D38A
- **Pure White** : #FFFFFF

### Composants UX
- **Logo** : Taille agrandie avec animation de pulsation douce (3s)
- **Loaders** : 4 types spécialisés avec transitions fluides
- **Pop-ups** : Fond blanc avec bordure bleue et ombres
- **Animations** : Fade-in, scale-in, pulse-slow, shimmer, spin

### Loaders Spécialisés
- **TransitionLoader** : Icône centrée + "Chargement..." pour login→app
- **PromptLoader** : Pop-up avec 15 étapes détaillées + barre de progression
- **ImageLoader** : Pop-up avec 25 étapes + barre de progression avec effet shimmer
- **PageLoader** : Loader plein écran pour les pages

## 🔐 Système d'Authentification

### Codes d'Accès
- `IMMO-STARTER-2025` : 40 crédits
- `IMMO-CONFORT-2025` : 150 crédits  
- `IMMO-PROMAX-2025` : 300 crédits
- `IMMOPIXTESTMVP07` : 3 crédits (avec blacklist automatique)

### Fonctionnement
1. **Connexion** : Email + code d'accès avec validation
2. **Vérification** : Validation du code, des crédits et blacklist
3. **Transition** : Loader élégant entre login et app (1 seconde)
4. **Session** : Création d'un token de session UUID
5. **Blacklist** : Blocage automatique si crédits épuisés (test uniquement)
6. **Middleware** : Protection des routes avec vérification session

## 💾 Base de Données

### Tables Principales
- **`usersmvp`** : Utilisateurs, crédits, sessions, plans
- **`blacklist`** : Utilisateurs bloqués (email + IP)

### Fonctionnalités
- Conservation des crédits lors de la reconnexion
- Blacklist automatique pour les utilisateurs de test
- Gestion des sessions sécurisée avec expiration
- Index optimisés pour les performances

## 🚀 Déploiement

### Production
- **Plateforme** : Vercel avec output standalone
- **URL** : https://immopix-azlaqsu4a-leos-projects-a64e53b8.vercel.app
- **Base de données** : Supabase
- **Démarrage** : `node .next/standalone/server.js`

### Configuration
- Variables d'environnement sécurisées (REPLICATE_API_TOKEN, etc.)
- Middleware d'authentification robuste
- Routes protégées avec validation
- Headers de sécurité configurés
- Version Node 18.x spécifiée

## 📋 Fonctionnalités

### Traitement d'Images
- Upload d'images (JPEG/PNG, max 15MB)
- Validation côté client et serveur
- Génération automatique de prompts via GPT-4o
- Traitement via Replicate AI (FluxContext Pro)
- Téléchargement des résultats en PNG
- Watermark automatique sur les images
- **Qualité optimisée** : Transmission base64 pour éviter la dégradation

### Gestion des Crédits
- Consommation automatique (1 crédit par image)
- Vérification côté serveur avant traitement
- Blocage si crédits insuffisants
- Mise à jour en temps réel
- **Écran de fin de test** : Affichage conditionnel quand crédits épuisés

### Options IA
- **Nettoyage automatique** : Suppression des objets indésirables
- **Ambiance personnalisée** : Style de décoration
- **Amélioration lumière** : Optimisation de l'éclairage
- **Texte libre** : Instructions personnalisées

### Expérience Utilisateur
- **Interface responsive** : Mobile et desktop optimisés
- **Drag & drop** : Upload d'images intuitif
- **Feedback visuel** : Loaders avec phrases dynamiques
- **Animations fluides** : Transitions professionnelles
- **Gestion d'erreurs** : Messages clairs et informatifs
- **Bloc d'aide intégré** : WhatsApp et Email sur login et app
- **Suppression du curseur clignotant** : Interface plus propre

### Sécurité
- Blacklist automatique pour les utilisateurs de test
- Validation des sessions avec expiration
- Protection contre la reconnexion avec 0 crédits
- Vérification IP pour la blacklist

## 🎨 Composants UX

### Loaders
- **TransitionLoader** : Icône + "Chargement..." pour login→app
- **PromptLoader** : Pop-up blanc avec 15 étapes + barre de progression
- **ImageLoader** : Pop-up identique avec 25 étapes + effet shimmer
- **PageLoader** : Loader plein écran pour les pages

### Animations
- **Pulse-slow** : Respiration du logo (3 secondes)
- **Spin** : Rotation des icônes de chargement
- **Fade-in-up** : Apparition des éléments avec délais
- **Scale-in** : Apparition des pop-ups
- **Shimmer** : Effet de reflet sur les barres de progression

### Interface
- **Glassmorphism** : Effets de transparence et flou
- **Gradients** : Fond doux et professionnel
- **Responsive** : Adaptation mobile et desktop
- **Accessibilité** : Standards WCAG respectés

## 🔧 Maintenance

### Logs
- Logs détaillés pour le debug avec emojis
- Traçabilité des opérations complète
- Gestion d'erreurs robuste avec fallbacks

### Base de Données
- Script SQL dans `context/setup_database.sql`
- Tables optimisées avec index
- Politiques RLS simplifiées
- Fonctions de nettoyage automatique

### Performance
- Build optimisé avec Next.js 14 standalone
- Images optimisées et compressées
- Animations CSS performantes
- Lazy loading des composants
- **Dépendances nettoyées** : Suppression de canvas et puppeteer

### API Routes
- **`/api/user-data`** : Récupération données utilisateur
- **`/api/process-image`** : Traitement d'images via Replicate
- **`/api/analyze-image`** : Analyse visuelle via GPT-4o
- **`/api/upload-image`** : Upload temporaire pour analyse
- **`/api/logout`** : Déconnexion et invalidation session
- **`/api/debug-blacklist`** : Debug de la blacklist
- **`/api/reset-test`** : Reset des crédits de test

### Middleware
- Protection des routes sensibles
- Vérification des sessions
- Ajout des données utilisateur aux headers
- Mise à jour de la dernière activité
- Redirection automatique vers login

## 🛠️ Corrections Récentes

### Problèmes de Build Résolus
- **Clés secrètes sécurisées** : REPLICATE_API_TOKEN dans variables d'environnement
- **Version Node harmonisée** : Node 18.x spécifiée
- **Dépendances nettoyées** : Suppression de canvas et puppeteer
- **Configuration Next.js optimisée** : Suppression des conflits experimental
- **Fichiers de test supprimés** : Nettoyage des références localhost

### Optimisations de Qualité d'Image
- **Transmission base64** : Évite la dégradation via services tiers
- **Qualité native** : Pas de compression avant envoi à Replicate
- **Résolution originale** : Conservation de la qualité maximale

### Interface Améliorée
- **Bloc d'aide intégré** : WhatsApp et Email sur login et app
- **Écran de fin de test** : Affichage conditionnel quand crédits épuisés
- **Suppression du curseur clignotant** : Interface plus propre
- **Suppression du bouton Accueil** : Interface épurée
- **Icône de crédits mise à jour** : Pièce au lieu du portefeuille
chore: test push
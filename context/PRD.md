# ImmoPix AI - Product Requirements Document

## 🎯 Vision Produit

ImmoPix AI est une plateforme web permettant aux professionnels de l'immobilier d'optimiser leurs photos avec l'intelligence artificielle, améliorant ainsi la présentation de leurs biens. L'application utilise GPT-4o pour l'analyse visuelle et Replicate AI pour le traitement d'images.

## 👥 Utilisateurs Cibles

### Personas Principaux
- **Agents immobiliers** : Optimisation des photos de biens
- **Photographes immobiliers** : Amélioration de leurs clichés
- **Particuliers** : Préparation de photos pour la vente

## 🔐 Système d'Accès

### Codes d'Accès
- **Starter** : 40 crédits - Usage occasionnel
- **Confort** : 150 crédits - Usage régulier
- **Promax** : 300 crédits - Usage intensif
- **Test** : 3 crédits - Évaluation (avec blacklist automatique)

### Sécurité
- **Blacklist automatique** : Protection contre l'abus des codes de test
- **Validation crédits** : Vérification côté serveur et middleware
- **Sessions sécurisées** : Tokens d'authentification avec expiration 24h
- **Vérification IP** : Blacklist par email et adresse IP

## 🎨 Fonctionnalités Principales

### 1. Authentification
- **Connexion** : Email + code d'accès avec validation
- **Validation** : Vérification des crédits et blacklist
- **Session** : Gestion sécurisée avec middleware
- **Transition** : Loader élégant entre login et app (1 seconde)
- **Expiration** : Sessions automatiquement invalidées après 24h

### 2. Upload d'Images
- **Formats** : JPEG, PNG uniquement
- **Taille** : Maximum 15MB
- **Validation** : Côté client et serveur
- **Interface** : Drag & drop + sélection fichier
- **Feedback** : Aperçu immédiat de l'image sélectionnée

### 3. Options IA Personnalisées
- **Nettoyage automatique** : Suppression des objets indésirables
- **Ambiance personnalisée** : Style de décoration (ex: haussmannien, moderne)
- **Amélioration lumière** : Optimisation de l'éclairage naturel
- **Texte libre** : Instructions personnalisées pour l'IA

### 4. Génération de Prompts
- **IA** : OpenAI GPT-4o avec analyse visuelle
- **Personnalisation** : Intégration des options utilisateur
- **Optimisation** : Prompts spécialisés immobilier
- **Interface** : Pop-up avec 15 étapes détaillées + barre de progression
- **Fallback** : Prompts par défaut en cas d'échec API

### 5. Traitement d'Images
- **IA** : Replicate (FluxContext Pro)
- **Qualité** : Haute définition avec préservation des proportions
- **Temps** : Traitement asynchrone avec polling
- **Interface** : Pop-up avec 25 étapes détaillées + barre de progression
- **Watermark** : Logo automatique sur les images traitées
- **Optimisation** : Transmission base64 pour qualité native

### 6. Téléchargement
- **Format** : PNG haute qualité
- **Sécurité** : Liens temporaires via Replicate
- **Facilité** : Un clic pour télécharger
- **Compatibilité** : Ordinateur et mobile

### 7. Support Utilisateur
- **Bloc d'aide intégré** : WhatsApp et Email sur login et app
- **Contact direct** : Liens vers support technique
- **Accessibilité** : Interface épurée sans éléments parasites

### 8. Gestion des Crédits
- **Consommation** : 1 crédit par image traitée
- **Validation** : Vérification avant traitement
- **Protection** : Blocage si crédits insuffisants
- **Écran de fin** : Affichage conditionnel quand crédits épuisés

## 🎨 Design et UX

### Logo et Branding
- **Logo texte** : Taille agrandie avec animation de pulsation douce (3s)
- **Icône** : Rotation fluide dans les loaders
- **Animation** : Effet de respiration lente
- **Watermark** : Logo sur les images traitées

### Loaders et Transitions
- **Transition login→app** : Icône centrée + "Chargement..." (1s)
- **Prompt loader** : Pop-up blanc avec bordure bleue + 15 étapes + barre de progression
- **Image loader** : Pop-up identique avec 25 étapes + effet shimmer
- **Phrases dynamiques** : Rotation toutes les 1,7 secondes
- **Page loader** : Loader plein écran pour les pages

### Interface
- **Palette** : Bleu glacier (#0099FF) + vert accent (#00D38A)
- **Fond** : Gradient doux (#F6F9FF → #EAF4FF → #d1e7f0)
- **Glassmorphism** : Effets de transparence et flou
- **Responsive** : Mobile et desktop optimisés
- **Police** : Sora (Google Fonts)
- **Épurée** : Suppression du curseur clignotant et bouton Accueil

### Composants UX
- **GlassCard** : Cartes avec effet glassmorphism
- **Button** : Boutons avec gradients et animations
- **CreditsIcon** : Affichage des crédits avec icône de pièce
- **TypewriterText** : Texte animé type machine à écrire

## 💰 Modèle Économique

### Plans Tarifaires
- **Starter** : 40 crédits - Entrée de gamme
- **Confort** : 150 crédits - Usage professionnel
- **Promax** : 300 crédits - Usage intensif
- **Test** : 3 crédits - Évaluation limitée

### Gestion des Crédits
- **Consommation** : 1 crédit par image traitée
- **Validation** : Vérification avant traitement
- **Protection** : Blocage si crédits insuffisants
- **Conservation** : Crédits préservés lors de la reconnexion

## 🔒 Sécurité et Conformité

### Protection des Données
- **Stockage** : Supabase (PostgreSQL) avec RLS
- **Chiffrement** : En transit et au repos
- **Sessions** : Tokens sécurisés avec expiration
- **Headers** : Sécurité configurée (X-Frame-Options, CSP, etc.)
- **Variables d'environnement** : Clés API sécurisées

### Anti-Abus
- **Blacklist** : Protection automatique par email et IP
- **Validation** : Multi-niveaux (client, serveur, middleware)
- **Monitoring** : Logs détaillés avec emojis
- **Limitation** : Codes de test avec blacklist automatique

## 📱 Expérience Utilisateur

### Interface
- **Design** : Moderne et intuitif avec glassmorphism
- **Responsive** : Mobile et desktop optimisés
- **Accessibilité** : Standards WCAG respectés
- **Animations** : Fluides et professionnelles
- **Épurée** : Interface sans éléments parasites

### Performance
- **Vitesse** : Upload et traitement optimisés
- **Feedback** : Messages d'état clairs et informatifs
- **Erreurs** : Gestion gracieuse avec fallbacks
- **Build** : Next.js 14 standalone pour performance
- **Qualité** : Transmission base64 pour éviter la dégradation

### Workflow Utilisateur
1. **Connexion** : Email + code → validation → transition loader
2. **Upload** : Drag & drop ou sélection → aperçu immédiat
3. **Options** : Configuration des paramètres IA
4. **Analyse** : Génération prompt avec GPT-4o
5. **Traitement** : Amélioration image avec Replicate
6. **Résultat** : Téléchargement avec watermark
7. **Support** : Accès direct au support via bloc d'aide

## 🚀 Roadmap

### Phase 1 (Actuelle) ✅
- ✅ Authentification par codes avec middleware
- ✅ Traitement d'images via Replicate AI
- ✅ Analyse visuelle via GPT-4o
- ✅ Gestion des crédits avec validation
- ✅ Système de blacklist automatique
- ✅ Interface UX premium avec glassmorphism
- ✅ Loaders et transitions élégantes
- ✅ Logo et branding optimisés
- ✅ Options IA personnalisées
- ✅ Watermark automatique
- ✅ Responsive design complet
- ✅ Bloc d'aide intégré (WhatsApp/Email)
- ✅ Écran de fin de test conditionnel
- ✅ Interface épurée (suppression curseur/bouton)
- ✅ Optimisation qualité d'image (base64)
- ✅ Build optimisé (dépendances nettoyées)

### Phase 2 (Future)
- 🔄 Historique des traitements
- 🔄 Batch processing
- 🔄 API publique
- 🔄 Intégrations tierces
- 🔄 Analytics avancées

## 📊 Métriques de Succès

### Utilisation
- **Utilisateurs actifs** : Sessions quotidiennes
- **Images traitées** : Volume mensuel
- **Taux de conversion** : Test vers payant
- **Crédits consommés** : Utilisation du service

### Technique
- **Performance** : Temps de traitement (< 30s)
- **Disponibilité** : Uptime du service
- **Erreurs** : Taux de succès (> 95%)
- **Sécurité** : Tentatives de contournement bloquées
- **Build** : Temps de compilation < 120s

### UX
- **Temps de chargement** : < 3 secondes
- **Taux de complétion** : > 90%
- **Satisfaction** : Feedback utilisateur
- **Accessibilité** : Conformité WCAG

## 🔧 Architecture Technique

### Frontend
- **Framework** : Next.js 14 (App Router) avec output standalone
- **Language** : TypeScript
- **Styling** : Tailwind CSS avec classes personnalisées
- **État** : React Hooks (useState, useEffect, useRef)

### Backend
- **API** : Next.js API Routes
- **Base de données** : Supabase (PostgreSQL)
- **IA** : OpenAI GPT-4o + Replicate AI
- **Middleware** : Authentification et validation

### Déploiement
- **Plateforme** : Vercel avec output standalone
- **Démarrage** : `node .next/standalone/server.js`
- **Configuration** : Variables d'environnement sécurisées
- **Sécurité** : Headers et middleware configurés
- **Version** : Node 18.x spécifiée

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

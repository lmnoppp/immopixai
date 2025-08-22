# ImmoPix AI - Logique Technique

## 🔄 Flux d'Authentification

### 1. Connexion Utilisateur
```
Email + Code → Validation → Vérification Blacklist → Création/Mise à jour utilisateur → Session → Transition Loader → Redirection
```

### 2. Vérification des Crédits
- **Nouvel utilisateur** : Crédits du code d'accès
- **Utilisateur existant** : Conservation des crédits existants
- **Vérification** : Blocage si crédits ≤ 0
- **Blacklist** : Vérification par email ET IP pour les codes de test

### 3. Système de Blacklist
- **Déclenchement** : Crédits épuisés pour le code de test
- **Action** : Blacklist automatique de l'email ET de l'IP
- **Résultat** : Connexion impossible
- **Vérification** : Double vérification (email + IP)

## 🎨 Système de Loaders et UX

### 1. Transition Login → App
- **Composant** : `TransitionLoader`
- **Affichage** : Icône centrée + "Chargement..."
- **Durée** : 1 seconde avant redirection
- **Style** : Simple et fluide avec animation spin

### 2. Génération de Prompt
- **Composant** : `PromptLoader`
- **Interface** : Pop-up blanc avec bordure bleue
- **Barre de progression** : Bleue et épaisse (h-3) avec effet shimmer
- **Phrases** : 15 étapes détaillées, rotation 1,7s
- **Animation** : Apparition douce (`animate-scale-in`)

### 3. Traitement d'Image
- **Composant** : `ImageLoader`
- **Interface** : Pop-up identique au prompt
- **Barre de progression** : Avec effet de reflet shimmer
- **Phrases** : 25 étapes détaillées, rotation 1,7s
- **Synchronisation** : Avec durée réelle du traitement

### 4. Page Loader
- **Composant** : `PageLoader`
- **Affichage** : Loader plein écran pour les pages
- **Style** : Fond gradient avec TransitionLoader centré

## 💾 Gestion des Données

### Table `usersmvp`
```sql
- id (UUID, PK)
- email (VARCHAR)
- code (VARCHAR)
- plan (VARCHAR)
- credits (INTEGER)
- login_date (TIMESTAMP)
- last_activity (TIMESTAMP)
- session_token (VARCHAR)
- created_at (TIMESTAMP)
```

### Table `blacklist`
```sql
- id (UUID, PK)
- email (VARCHAR)
- ip_address (VARCHAR)
- reason (TEXT)
- created_at (TIMESTAMP)
```

### Index Optimisés
```sql
- idx_usersmvp_email
- idx_usersmvp_code
- idx_usersmvp_session_token
- idx_usersmvp_last_activity
- idx_blacklist_email
- idx_blacklist_ip
```

## 🎨 Design System

### Palette de Couleurs
- **Primary Blue** : #0099FF
- **Light Blue** : #F6F9FF
- **Medium Blue** : #EAF4FF
- **Dark Blue** : #d1e7f0
- **Accent Green** : #00D38A
- **Pure White** : #FFFFFF

### Animations
- **Pulse-slow** : Respiration du logo (3s)
- **Spin** : Rotation des icônes
- **Fade-in-up** : Apparition des éléments avec délais
- **Scale-in** : Apparition des pop-ups
- **Shimmer** : Effet de reflet sur les barres

### Composants
- **Logo** : Taille agrandie (sm: h-10, md: h-16, lg: h-24, xl: h-32)
- **Loaders** : Icônes centrées avec flexbox
- **Pop-ups** : Fond blanc, bordure bleue, ombre
- **Boutons** : Gradients avec animations hover

## 🔐 Sécurité

### Middleware d'Authentification
- **Routes protégées** : `/app`, `/api/process-image`, `/api/analyze-image`, `/api/upload-image`, `/api/user-data`, `/api/logout`
- **Routes de debug** : `/api/debug-blacklist`, `/api/reset-test` (pas d'auth)
- **Vérification** : Token de session valide
- **Expiration** : 24 heures d'inactivité
- **Headers** : Ajout des données utilisateur (x-user-id, x-user-email, etc.)

### Validation des Crédits
- **Côté serveur** : Vérification avant traitement
- **Consommation** : Décrémentation atomique
- **Protection** : Blocage si crédits insuffisants
- **Blacklist** : Automatique pour les utilisateurs de test

## 🎯 Traitement d'Images

### Flux Complet
1. **Upload** : Validation format/taille (JPEG/PNG, max 15MB)
2. **Options IA** : Nettoyage, ambiance, lumière, texte libre
3. **Analyse visuelle** : GPT-4o avec image en base64
4. **Génération prompt** : Intégration des options utilisateur
5. **Traitement** : Replicate AI (FluxContext Pro)
6. **Résultat** : Téléchargement PNG avec watermark

### Optimisation Qualité
- **Transmission base64** : Évite la dégradation via services tiers
- **Qualité native** : Pas de compression avant envoi à Replicate
- **Résolution originale** : Conservation de la qualité maximale

### Gestion des Erreurs
- **Validation** : Format, taille, crédits
- **Retry** : Gestion des échecs API
- **Feedback** : Messages d'erreur clairs
- **Fallback** : Prompts par défaut en cas d'échec GPT-4o

## 🎨 Interface Utilisateur

### Support Intégré
- **Bloc d'aide** : WhatsApp et Email sur login et app
- **Localisation** : Bas de page avec design cohérent
- **Liens** : 
  - WhatsApp : `https://wa.me/33695297985`
  - Email : `mailto:contact@immopix-ai.site`
- **Tooltips** : Explications au survol
- **Animation** : Hover avec scale et shadow

### Écran de Fin de Test
- **Déclenchement** : Quand crédits épuisés après génération
- **Contenu** : Message explicatif avec bouton "Découvrir nos offres"
- **Style** : Même design que l'interface principale
- **Bloc d'aide** : Intégré dans l'écran de fin

### Interface Épurée
- **Suppression du curseur clignotant** : CSS global `caret-color: transparent`
- **Réactivation pour les champs** : `input, textarea { caret-color: auto; }`
- **Suppression du bouton Accueil** : Navigation simplifiée
- **Icône de crédits mise à jour** : Pièce au lieu du portefeuille

## 🔧 Optimisations

### Performance
- **Index** : Sur email, code, session_token, last_activity
- **Cache** : Sessions en base avec expiration
- **Validation** : Côté client et serveur
- **Build** : Next.js 14 standalone
- **Dépendances nettoyées** : Suppression de canvas et puppeteer

### UX
- **Loaders** : Feedback visuel constant avec phrases dynamiques
- **Transitions** : Fluides et professionnelles
- **Responsive** : Mobile et desktop optimisés
- **Accessibilité** : Standards WCAG respectés

### Sécurité
- **Blacklist** : Protection contre l'abus par email ET IP
- **Sessions** : Tokens sécurisés avec expiration
- **Validation** : Multi-niveaux (client, serveur, middleware)
- **Headers** : Sécurité configurée (X-Frame-Options, CSP, etc.)
- **Variables d'environnement** : Clés API sécurisées

## 📊 Monitoring

### Logs
- **Connexions** : Suivi des tentatives avec emojis
- **Erreurs** : Traçabilité complète avec fallbacks
- **Performance** : Temps de réponse et polling
- **Sécurité** : Tentatives de contournement

### Métriques
- **Utilisateurs actifs** : Sessions valides
- **Crédits consommés** : Utilisation du service
- **Erreurs** : Taux de succès
- **UX** : Temps de chargement et complétion

## 🔄 API Routes

### Routes Protégées
- **`/api/user-data`** : Récupération données utilisateur
- **`/api/process-image`** : Traitement d'images via Replicate
- **`/api/analyze-image`** : Analyse visuelle via GPT-4o
- **`/api/upload-image`** : Upload temporaire pour analyse
- **`/api/logout`** : Déconnexion et invalidation session

### Routes Publiques
- **`/api/debug-blacklist`** : Debug de la blacklist
- **`/api/reset-test`** : Reset des crédits de test
- **`/api/robots`** : Robots.txt dynamique

### Middleware
- **Protection** : Vérification session pour routes protégées
- **Headers** : Ajout des données utilisateur
- **Activité** : Mise à jour last_activity
- **Redirection** : Vers login si session invalide

## 🎨 Composants Spécialisés

### Loaders
- **TransitionLoader** : Icône + "Chargement..." pour login→app
- **PromptLoader** : 15 étapes + barre de progression
- **ImageLoader** : 25 étapes + effet shimmer
- **PageLoader** : Loader plein écran

### Interface
- **GlassCard** : Effet glassmorphism avec animations
- **Button** : Gradients et animations hover
- **CreditsIcon** : Affichage des crédits avec icône de pièce
- **Logo** : Animation de pulsation douce

### Animations
- **Fade-in-up** : Apparition avec délais progressifs
- **Scale-in** : Apparition des pop-ups
- **Pulse-slow** : Respiration du logo (3s)
- **Spin** : Rotation des icônes
- **Shimmer** : Effet de reflet sur les barres

## 🔧 Configuration

### Next.js
- **Output** : Standalone pour déploiement
- **Images** : Domaine replicate.delivery autorisé
- **Headers** : Sécurité configurée
- **Rewrites** : Robots.txt dynamique
- **Version Node** : 18.x spécifiée

### Supabase
- **URL** : https://tkioemqyfoqseacryiiu.supabase.co
- **Clé** : Service role pour permissions complètes
- **RLS** : Politiques simplifiées
- **Index** : Optimisés pour performance

### APIs Externes
- **OpenAI** : GPT-4o pour analyse visuelle
- **Replicate** : FluxContext Pro pour traitement d'images
- **IP Detection** : api.ipify.org pour récupération IP

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


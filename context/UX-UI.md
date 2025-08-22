# UX / UI — Expérience utilisateur Immopix

## Parcours utilisateur

### 1. Accès `/login`
   - Formulaire email + code avec validation
   - Validation code → vérification blacklist → transition loader → redirection `/app`
   - **Loader de transition** : Icône centrée + "Chargement..." (1 seconde)
   - Gestion d'erreurs avec messages clairs
   - **Bloc d'aide intégré** : WhatsApp et Email en bas de page

### 2. Accès `/app`
   - Affichage crédits restants avec icône de pièce
   - Upload d'une image (drag & drop + sélection) avec aperçu immédiat
   - Choix options IA (cases à cocher + champs texte)
   - Bouton "Améliorer la demande avec l'IA"
   - **Pop-up prompt** : Fond blanc, bordure bleue, 15 étapes détaillées + barre de progression
   - Prompt affiché avec possibilité de reformulation
   - Bouton "Améliorer avec l'IA" → appel Replicate
   - **Pop-up traitement** : Fond blanc, bordure bleue, 25 étapes + barre de progression avec effet shimmer
   - Affichage de l'image finale avec watermark
   - Téléchargement en PNG
   - Crédit -1 avec mise à jour en temps réel
   - **Écran de fin de test** : Affichage conditionnel quand crédits épuisés
   - **Bloc d'aide intégré** : WhatsApp et Email en bas de page

## Composants UX

### Logo et Branding
- **Logo texte** : Taille agrandie avec animation de pulsation douce (3 secondes)
- **Animation** : Effet de respiration lente
- **Affichage** : Sur toutes les pages de branding
- **Watermark** : Logo sur les images traitées

### Loaders et Transitions
- **Transition login→app** : Icône centrée + "Chargement..." (1 seconde)
- **Prompt loader** : Pop-up blanc avec bordure bleue + 15 étapes + barre de progression
- **Image loader** : Pop-up identique avec 25 étapes + effet shimmer
- **Page loader** : Loader plein écran pour les pages
- **Phrases dynamiques** : Rotation toutes les 1,7 secondes

### Interface
- **Palette** : Bleu glacier (#0099FF) + vert accent (#00D38A)
- **Fond** : Gradient doux (#F6F9FF → #EAF4FF → #d1e7f0)
- **Glassmorphism** : Effets de transparence et flou
- **Responsive** : Mobile et desktop optimisés
- **Police** : Sora (Google Fonts)
- **Épurée** : Suppression du curseur clignotant et bouton Accueil

### Composants Spécialisés
- **GlassCard** : Cartes avec effet glassmorphism et animations
- **Button** : Boutons avec gradients et animations hover
- **CreditsIcon** : Affichage des crédits avec icône de pièce
- **TypewriterText** : Texte animé type machine à écrire

## Support Utilisateur

### Bloc d'Aide Intégré
- **Localisation** : Bas de page sur `/login` et `/app`
- **Contenu** : "Besoin d'aide ? Contactez-nous"
- **Icônes** : WhatsApp et Email côte à côte
- **Liens** : 
  - WhatsApp : `https://wa.me/33695297985`
  - Email : `mailto:contact@immopix-ai.site`
- **Tooltips** : "Parler à l'équipe sur WhatsApp" et "Envoyer un mail à l'équipe"
- **Animation** : Hover avec scale et shadow

### Écran de Fin de Test
- **Déclenchement** : Quand crédits épuisés après génération
- **Contenu** : "Votre test gratuit est terminé. Vous avez utilisé tous vos crédits de test. Mais bonne nouvelle : vous pouvez débloquer toutes les retouches IA en activant l'abonnement."
- **Bouton** : "Découvrir nos offres" (TODO pour redirection)
- **Style** : Même design que l'interface principale
- **Bloc d'aide** : Intégré dans l'écran de fin

## Feedback utilisateur

### États de Chargement
- **Loader IA** pendant traitement avec phrases détaillées
- **Barres de progression** avec effet de reflet shimmer
- **Messages d'état** clairs et informatifs
- **Phrases dynamiques** qui tournent toutes les 1,7s

### Gestion d'Erreurs
- **Message "crédit insuffisant"** si 0 crédits
- **Validation** des formats et tailles d'images (JPEG/PNG, max 15MB)
- **Confirmation visuelle** après téléchargement
- **Messages d'erreur** avec icônes et couleurs appropriées

### Animations
- **Fade-in-up** : Apparition des éléments avec délais progressifs
- **Scale-in** : Apparition des pop-ups
- **Pulse-slow** : Respiration du logo (3s)
- **Spin** : Rotation des icônes de chargement
- **Shimmer** : Effet de reflet sur les barres de progression

## Responsive Design

### Mobile
- Interface adaptée aux écrans tactiles
- Boutons et zones de clic optimisés
- Navigation simplifiée
- Textes adaptatifs avec classes responsive

### Desktop
- Interface complète avec toutes les fonctionnalités
- Animations et effets visuels optimisés
- Expérience premium avec glassmorphism
- Layout en grille pour les options

## Options IA

### Interface
- **Cases à cocher** : Nettoyage automatique, amélioration lumière
- **Champs texte** : Ambiance personnalisée, instructions libres
- **Affichage conditionnel** : Options qui apparaissent selon les choix
- **Validation** : Feedback en temps réel

### Fonctionnalités
- **Nettoyage automatique** : Suppression des objets indésirables
- **Ambiance personnalisée** : Style de décoration (haussmannien, moderne, etc.)
- **Amélioration lumière** : Optimisation de l'éclairage naturel
- **Texte libre** : Instructions personnalisées pour l'IA

## Footer

- **Email support** : `contact@immopix-ai.site`
- **WhatsApp** : lien direct cliquable avec numéro de téléphone +33 695297985
- **Responsive** : Adaptation mobile et desktop
- **Bloc d'aide intégré** : Remplace l'ancien footer

## Accessibilité

- **Contraste** : Respect des standards WCAG
- **Navigation** : Compatible clavier
- **Textes** : Tailles adaptatives avec classes responsive
- **Couleurs** : Palette accessible avec fallbacks
- **Focus** : Indicateurs visuels pour la navigation
- **Interface épurée** : Suppression du curseur clignotant

## Workflow Utilisateur

### 1. Connexion
- Saisie email + code d'accès
- Validation et vérification blacklist
- Transition loader élégant
- Redirection vers l'espace de travail

### 2. Upload d'Image
- Drag & drop ou sélection de fichier
- Validation format et taille
- Aperçu immédiat de l'image
- Feedback visuel de l'état

### 3. Configuration IA
- Sélection des options de traitement
- Saisie des préférences personnalisées
- Interface intuitive avec cases à cocher

### 4. Génération de Prompt
- Analyse visuelle avec GPT-4o
- Pop-up avec 15 étapes détaillées
- Barre de progression avec effet shimmer
- Affichage du prompt généré

### 5. Traitement d'Image
- Envoi vers Replicate AI
- Pop-up avec 25 étapes détaillées
- Barre de progression synchronisée
- Watermark automatique

### 6. Résultat
- Affichage de l'image traitée
- Téléchargement en un clic
- Mise à jour des crédits
- Feedback de succès

### 7. Support
- Accès direct au support via bloc d'aide
- Contact WhatsApp et Email intégrés

## Composants Visuels

### Loaders
- **TransitionLoader** : Icône + "Chargement..." pour login→app
- **PromptLoader** : 15 étapes + barre de progression
- **ImageLoader** : 25 étapes + effet shimmer
- **PageLoader** : Loader plein écran

### Cartes et Conteneurs
- **GlassCard** : Effet glassmorphism avec animations
- **GlassCardWithTitle** : Cartes avec titre et icône
- **Upload zone** : Zone de drag & drop avec feedback

### Boutons
- **Primary** : Gradient bleu avec animations
- **Success** : Gradient vert pour les actions positives
- **Secondary** : Style alternatif pour les actions secondaires
- **Ghost** : Style minimal pour les actions discrètes

### Icônes et Indicateurs
- **CreditsIcon** : Affichage des crédits avec icône de pièce
- **Logo** : Animation de pulsation douce
- **Watermark** : Logo sur les images traitées
- **AlertCircle** : Messages d'erreur avec icône

## Animations et Transitions

### Keyframes Personnalisées
- **Pulse-slow** : Respiration du logo (3s)
- **Spin** : Rotation des icônes
- **Fade-in-up** : Apparition des éléments
- **Scale-in** : Apparition des pop-ups
- **Shimmer** : Effet de reflet

### Classes CSS
- **animate-pulse-slow** : Respiration lente
- **animate-spin** : Rotation continue
- **animate-fade-in-up** : Apparition vers le haut
- **animate-scale-in** : Apparition par zoom
- **animate-shimmer** : Effet de reflet

### Délais d'Animation
- **0.1s** : Header et navigation
- **0.2s** : Titres principaux
- **0.4s** : Contenu principal
- **0.6s** : Éléments secondaires
- **0.8s** : Footer et éléments finaux

## États d'Interface

### États de Chargement
- **Initial** : Page en cours de chargement
- **Authentification** : Vérification des credentials
- **Upload** : Traitement du fichier
- **Analyse** : Génération du prompt
- **Traitement** : Amélioration de l'image

### États d'Erreur
- **Validation** : Erreurs de saisie
- **Authentification** : Codes invalides
- **Upload** : Fichiers non supportés
- **API** : Erreurs de traitement
- **Crédits** : Crédits insuffisants

### États de Succès
- **Connexion** : Authentification réussie
- **Upload** : Fichier accepté
- **Prompt** : Génération réussie
- **Traitement** : Image améliorée
- **Téléchargement** : Fichier prêt

### États Spéciaux
- **Fin de test** : Écran conditionnel quand crédits épuisés
- **Support** : Accès direct via bloc d'aide intégré

## Améliorations Récentes

### Interface Épurée
- **Suppression du curseur clignotant** : Interface plus propre
- **Suppression du bouton Accueil** : Navigation simplifiée
- **Icône de crédits mise à jour** : Pièce au lieu du portefeuille

### Support Intégré
- **Bloc d'aide** : WhatsApp et Email sur login et app
- **Tooltips informatifs** : Explications au survol
- **Liens directs** : Contact immédiat

### Qualité d'Image
- **Transmission base64** : Évite la dégradation via services tiers
- **Qualité native** : Pas de compression avant envoi à Replicate
- **Résolution originale** : Conservation de la qualité maximale 

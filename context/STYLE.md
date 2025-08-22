# STYLE — Convention de code et design

## Langage
- TypeScript only
- Utiliser des fonctions utilitaires (lib/) pour appels API
- Hooks React pour la gestion d'état
- Composants fonctionnels avec props typées

## Structure
- Composants réutilisables dans `/components`
- Pages : `/login`, `/app`
- Loaders : `TransitionLoader`, `PromptLoader`, `ImageLoader`, `PageLoader`
- API Routes dans `/app/api`
- Middleware pour l'authentification

## Palette de Couleurs

### Couleurs Principales
- **Primary Blue** : `#0099FF` - Couleur principale
- **Light Blue** : `#F6F9FF` - Fond clair
- **Medium Blue** : `#EAF4FF` - Fond moyen
- **Dark Blue** : `#d1e7f0` - Fond sombre
- **Accent Green** : `#00D38A` - Couleur d'accent
- **Pure White** : `#FFFFFF` - Blanc pur

### Classes Tailwind
- Fond : `bg-gradient-to-br from-[#F6F9FF] via-[#EAF4FF] to-[#d1e7f0]`
- Texte bleu : `text-[#0099FF]`
- Texte vert : `text-[#00D38A]`
- Bordures : `border-[#0099FF]`
- Gradients : `bg-gradient-to-r from-[#0099FF] to-[#0088cc]`

## Composants

### Logo
- **Tailles** : `sm: h-10`, `md: h-16`, `lg: h-24`, `xl: h-32`
- **Animation** : `animate-pulse-slow` (respiration 3s)
- **Watermark** : Version réduite pour les images

### Loaders
- **Icônes** : Centrées avec `flex items-center justify-center`
- **Pop-ups** : `bg-white border-2 border-[#0099FF] rounded-3xl shadow-xl`
- **Barres de progression** : `bg-[#0099FF] h-3 rounded-full`
- **Effet shimmer** : `animate-shimmer` sur les barres

### Boutons
- **Primary** : `bg-gradient-to-r from-[#0099FF] to-[#0088cc]`
- **Success** : `bg-gradient-to-r from-[#00D38A] to-[#00b377]`
- **Secondary** : `bg-gray-100 hover:bg-gray-200`
- **Ghost** : `bg-transparent hover:bg-gray-50`
- **Hover** : `hover:-translate-y-0.5` avec ombre
- **Loading** : `ButtonLoader` avec icône et texte

### Cartes
- **GlassCard** : `glass chrome-effect` avec effet glassmorphism
- **GlassCardWithTitle** : Version avec titre et icône
- **Upload zone** : `upload-zone` avec feedback visuel

### Bloc d'Aide
- **Conteneur** : `text-center fade-in` avec délai d'animation
- **Texte** : `text-gray-600 text-sm mb-4`
- **Icônes** : `w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl`
- **Hover** : `hover:scale-110 hover:shadow-lg hover:bg-white`
- **Transition** : `transition-all duration-300`

## Classes Utiles
- `rounded-2xl` - Coins arrondis
- `glass chrome-effect` - Effet glassmorphism
- `backdrop-blur-xl` - Flou d'arrière-plan
- `animate-fade-in-up` - Animation d'apparition
- `animate-scale-in` - Animation de pop-up
- `animate-pulse-slow` - Respiration lente
- `animate-spin` - Rotation continue
- `animate-shimmer` - Effet de reflet

## Police
- `Sora` (Google Fonts) - Police principale
- `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` - Fallback
- **Configuration** : Dans `layout.tsx` avec variable CSS

## Animations
- **Pulse-slow** : Respiration du logo (3s)
- **Spin** : Rotation des icônes
- **Fade-in-up** : Apparition des éléments avec délais
- **Scale-in** : Apparition des pop-ups
- **Shimmer** : Effet de reflet sur les barres

### Keyframes Personnalisées
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## Responsive
- Mobile-first design
- Breakpoints : `sm:`, `md:`, `lg:`, `xl:`
- Textes adaptatifs : `text-responsive`, `text-responsive-lg`
- Layout en grille : `grid grid-cols-1 lg:grid-cols-2`

### Classes Responsive
- `text-responsive` : Taille de texte adaptative
- `text-responsive-lg` : Taille de texte large adaptative
- `p-4 sm:p-6 lg:p-8` : Padding adaptatif
- `text-sm sm:text-base lg:text-lg` : Texte adaptatif

## Glassmorphism
- Fond : `rgba(255, 255, 255, 0.15)`
- Bordure : `rgba(255, 255, 255, 0.25)`
- Ombre : `rgba(0, 0, 0, 0.08)`
- Flou : `backdrop-filter: blur(20px)`

### Classes Glassmorphism
- `glass` : Effet de base
- `chrome-effect` : Effet chrome
- `backdrop-blur-xl` : Flou d'arrière-plan

## États d'Interface

### États de Chargement
- `isLoading` : État de chargement général
- `isGeneratingPrompt` : Génération de prompt
- `isProcessingImage` : Traitement d'image
- `isTransitioning` : Transition entre pages

### États d'Erreur
- `error` : Message d'erreur
- `setError` : Fonction de gestion d'erreur
- Classes : `bg-red-50 border-red-200 text-red-700`

### États de Succès
- `processedImage` : Image traitée
- `prompt` : Prompt généré
- Classes : `bg-green-50 border-green-200 text-green-700`

### États Spéciaux
- `showTestEnded` : Affichage de l'écran de fin de test
- Classes : Même design que l'interface principale

## Composants Spécialisés

### Loaders
```typescript
// TransitionLoader
<TransitionLoader size="lg" />

// PromptLoader
<PromptLoader size="md" />

// ImageLoader
<ImageLoader size="lg" />

// PageLoader
<PageLoader />
```

### Boutons
```typescript
// Bouton principal
<Button size="lg" icon={<ArrowRight size={20} />}>
  Commencer maintenant
</Button>

// Bouton avec loading
<Button loading={isSubmitting} disabled={!isFormValid}>
  Se connecter
</Button>

// Bouton de succès
<Button variant="success" icon={<Download size={16} />}>
  Télécharger l'image
</Button>
```

### Cartes
```typescript
// Carte simple
<GlassCard className="space-y-6" delay={0.4}>
  {/* Contenu */}
</GlassCard>

// Carte avec titre
<GlassCardWithTitle
  title="Upload d'image"
  icon={<Upload size={20} />}
  delay={0.2}
>
  {/* Contenu */}
</GlassCardWithTitle>
```

### Bloc d'Aide
```typescript
// Bloc d'aide intégré
<div className="mt-6 text-center fade-in" style={{ animationDelay: '0.6s' }}>
  <p className="text-gray-600 text-sm mb-4">Besoin d'aide ? Contactez-nous</p>
  <div className="flex justify-center gap-6">
    {/* Icône WhatsApp */}
    <a href="https://wa.me/33695297985" target="_blank" rel="noopener noreferrer" 
       className="group relative" title="Parler à l'équipe sur WhatsApp">
      <div className="w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl 
                      flex items-center justify-center transition-all duration-300 
                      hover:scale-110 hover:shadow-lg hover:bg-white">
        {/* SVG WhatsApp */}
      </div>
    </a>
    
    {/* Icône Email */}
    <a href="mailto:contact@immopix-ai.site" className="group relative" 
       title="Envoyer un mail à l'équipe">
      <div className="w-12 h-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl 
                      flex items-center justify-center transition-all duration-300 
                      hover:scale-110 hover:shadow-lg hover:bg-white">
        {/* SVG Email */}
      </div>
    </a>
  </div>
</div>
```

## Validation et Erreurs

### Validation Côté Client
```typescript
// Validation email
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation fichier
const isValidFile = (file: File) => {
  return file.size <= 15 * 1024 * 1024 && 
         file.type.match(/image\/(jpeg|jpg|png)/);
};
```

### Messages d'Erreur
```typescript
// Structure d'erreur
{error && (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl fade-in">
    <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
    <p className="text-sm text-red-700">{error}</p>
  </div>
)}
```

## Accessibilité

### Classes d'Accessibilité
- `sr-only` : Éléments pour lecteurs d'écran
- `focus:outline-none focus:ring-2` : Focus visible
- `aria-label` : Labels pour les icônes
- `role` : Rôles ARIA appropriés

### Contraste
- Texte principal : Contraste suffisant
- Liens : Couleur distinctive
- Boutons : Contraste élevé
- Messages d'erreur : Rouge accessible

### Interface Épurée
- Suppression du curseur clignotant : `caret-color: transparent`
- Réactivation pour les champs : `input, textarea { caret-color: auto; }`

## Performance

### Optimisations CSS
- Classes utilitaires Tailwind
- Animations CSS optimisées
- Lazy loading des composants
- Images optimisées

### Classes de Performance
- `will-change-transform` : Optimisation des animations
- `transform-gpu` : Accélération GPU
- `backface-visibility-hidden` : Optimisation 3D

## Conventions de Nommage

### Composants
- PascalCase : `TransitionLoader`, `GlassCard`
- Props : camelCase : `isLoading`, `showProgress`
- Types : PascalCase avec suffixe : `LoaderProps`, `UserData`

### Variables
- camelCase : `userData`, `isProcessing`
- Constantes : UPPER_SNAKE_CASE : `REPLICATE_MODEL`
- Fonctions : camelCase : `handleImageUpload`, `generatePrompt`

### Classes CSS
- kebab-case : `fade-in-up`, `pulse-slow`
- Préfixes : `animate-`, `bg-`, `text-`
- Responsive : `sm:`, `md:`, `lg:`, `xl:`

## Améliorations Récentes

### Interface Épurée
- **Suppression du curseur clignotant** : CSS global pour masquer le caret
- **Suppression du bouton Accueil** : Navigation simplifiée
- **Icône de crédits mise à jour** : Pièce au lieu du portefeuille

### Support Intégré
- **Bloc d'aide** : Design cohérent avec l'interface
- **Tooltips informatifs** : Explications au survol
- **Liens directs** : Contact immédiat

### Qualité d'Image
- **Transmission base64** : Évite la dégradation via services tiers
- **Qualité native** : Pas de compression avant envoi à Replicate
- **Résolution originale** : Conservation de la qualité maximale

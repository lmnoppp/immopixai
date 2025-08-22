# ImmoPix V4 - Refonte Conversationnelle IA

## 🎯 Objectif

Refonte complète d'ImmoPix.ai avec une interface conversationnelle pour offrir une expérience utilisateur fluide et professionnelle.

## ✨ Nouvelles fonctionnalités

### Interface Conversationnelle
- **Chat en temps réel** avec l'IA
- **Étapes guidées** : Upload → Analyse → Options → Traitement → Résultat
- **Messages contextuels** selon l'étape en cours
- **Animations fluides** et transitions douces

### Analyse IA Intelligente
- **GPT-4o Vision** pour l'analyse d'images
- **Détection automatique** des défauts immobiliers :
  - Objets personnels
  - Problèmes d'éclairage
  - Décoration trop marquée
  - Défauts visuels (angles, déséquilibres)
- **Prompt système optimisé** pour l'analyse immobilière

### Traitement Flexible
- **Mode automatique** : correction basée sur l'analyse IA
- **Mode personnalisé** : 3 questions simples + champ libre
- **FluxContext Pro** via Replicate pour le traitement
- **Prompts générés dynamiquement** selon les préférences

## 🏗️ Architecture Technique

### Frontend
- **Next.js 14** avec App Router
- **Zustand** pour l'état global conversationnel
- **Tailwind CSS** avec design system existant
- **Animations fluides** (fade-in, scale-in, etc.)

### Backend
- **API Routes** optimisées pour le flux conversationnel
- **ImageKit** pour le CDN d'images
- **OpenAI GPT-4o** pour l'analyse et génération de prompts
- **Replicate** avec FluxContext Pro pour le traitement
- **Supabase** pour la gestion des utilisateurs et crédits

### Store Zustand
```typescript
interface ConversationState {
  // État de l'upload
  uploadedImage: string | null;
  isUploading: boolean;
  
  // État de l'analyse
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  
  // État du traitement
  isProcessing: boolean;
  processingOptions: ProcessingOptions | null;
  processedImage: string | null;
  
  // État de la conversation
  currentStep: 'upload' | 'analysis' | 'options' | 'processing' | 'result';
  messages: Array<Message>;
}
```

## 🔄 Parcours Utilisateur

### 1. Upload d'Image
- Sélection d'image (JPG/PNG, max 15MB)
- Upload automatique sur ImageKit
- Message de confirmation

### 2. Analyse IA
- Bouton "Analyser l'image" après upload
- Appel à GPT-4o Vision
- Affichage des problèmes détectés
- Question : automatique ou manuel ?

### 3. Choix du Traitement
#### Option A : Automatique
- Traitement basé uniquement sur l'analyse IA
- Aucune intervention utilisateur

#### Option B : Personnalisé
- 3 questions simples (Oui/Non)
- Champ texte pour éléments à préserver
- Génération de prompt personnalisé

### 4. Traitement
- Appel à FluxContext Pro via Replicate
- Consommation d'un crédit
- Affichage du résultat

### 5. Résultat
- Image optimisée affichée
- Bouton de téléchargement
- Possibilité de recommencer

## 🎨 Design System

### Couleurs
- **Primary Blue** : #0099FF
- **Light Blue** : #F6F9FF
- **Medium Blue** : #EAF4FF
- **Accent Green** : #00D38A
- **Pure White** : #FFFFFF

### Effets Visuels
- **Glassmorphism** avec backdrop-filter
- **Chrome effect** avec reflets animés
- **Animations fluides** (fade-in, scale-in, slide-in)
- **Transitions optimisées** pour Safari

## 📱 Composants Principaux

### Dashboard
- Interface conversationnelle complète
- Zone de chat avec messages
- Zone d'aperçu des images
- Actions contextuelles selon l'étape

### GlassCard
- Composant de base pour les cartes
- Effet glassmorphism
- Animations intégrées

### Loader
- Spinner animé pour les états de chargement
- Tailles configurables (sm, md, lg)

## 🔧 API Routes

### `/api/upload-image`
- Upload d'image sur ImageKit
- Validation du format et de la taille
- Retour de l'URL publique

### `/api/analyze-image`
- Analyse avec GPT-4o Vision
- Détection des défauts immobiliers
- Retour structuré (issues, summary)

### `/api/process-image`
- Génération de prompt selon le mode
- Appel à FluxContext Pro via Replicate
- Retour de l'image traitée

## 🚀 Démarrage

1. **Installation des dépendances**
```bash
npm install
```

2. **Configuration des variables d'environnement**
```bash
# .env.local
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token
```

3. **Démarrage du serveur**
```bash
npm run dev
```

4. **Accès à l'application**
```
http://localhost:3000/dashboard
```

## 🎯 Avantages de la Refonte

### Expérience Utilisateur
- **Interface intuitive** et conversationnelle
- **Guidage étape par étape**
- **Feedback en temps réel**
- **Animations fluides**

### Performance
- **Chargement optimisé** des images
- **Traitement asynchrone**
- **Gestion d'état centralisée**

### Maintenabilité
- **Architecture modulaire**
- **Code TypeScript** typé
- **Composants réutilisables**
- **API routes séparées**

## 🔮 Évolutions Futures

- **Historique des traitements**
- **Galerie d'images**
- **Templates de prompts**
- **Export en batch**
- **Intégration CRM**

---

**ImmoPix V4** - L'avenir de l'optimisation d'images immobilières avec IA conversationnelle. 
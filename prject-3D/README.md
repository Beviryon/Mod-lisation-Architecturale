# Modélisation Architecturale 3D

Un projet de visualisation 3D d'un bâtiment architectural développé avec **Angular** et **Three.js**.

## 📋 Table des matières
- [🎯 Description](#-description)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [🚀 Installation et lancement](#-installation-et-lancement)
- [📁 Structure du projet](#-structure-du-projet)
- [⚙️ Configuration](#️-configuration)
- [🎮 Utilisation](#-utilisation)
- [🎨 Personnalisation](#-personnalisation)
- [📐 Architecture technique](#-architecture-technique)
- [🔧 Développement](#-développement)

## 🎯 Description

Ce projet présente un **modèle 3D interactif** d'un bâtiment architectural simple comprenant :
- 4 murs formant une structure rectangulaire
- 1 porte d'entrée
- 2 fenêtres de tailles différentes
- Un toit et un sol
- Un système d'axes de référence

Le modèle est entièrement **interactif** avec des contrôles souris pour la navigation 3D.

## ✨ Fonctionnalités

### 🎮 **Contrôles interactifs**
- **Rotation** : Clic gauche + glisser pour faire tourner la vue
- **Zoom** : Molette de la souris pour zoomer/dézoomer
- **Réinitialisation** : Bouton pour revenir à la vue initiale

### 🏠 **Éléments architecturaux**
- **Mur principal** : Façade avec ouvertures réelles (ExtrudeGeometry)
- **Murs latéraux** : Murs pleins gauche, droit et arrière
- **Ouvertures** : Porte verte et fenêtres rouges
- **Structure** : Sol marron et toit bleu
- **Repères** : Axes X, Y, Z avec marqueurs colorés

### 💡 **Éclairage réaliste**
- **Lumière ambiante** : Éclairage général doux
- **Lumière directionnelle** : Simulation du soleil avec ombres
- **Ombres portées** : Rendu réaliste des ombres

## 🛠️ Technologies utilisées

- **[Angular 19](https://angular.dev/)** - Framework web moderne
- **[Three.js](https://threejs.org/)** - Bibliothèque 3D WebGL
- **[TypeScript](https://www.typescriptlang.org/)** - Langage de programmation typé
- **[Vite](https://vitejs.dev/)** - Outil de build rapide
- **HTML5 & CSS3** - Structure et style

## Installation et lancement

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** (inclus avec Node.js)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Beviryon/Mod-lisation-Architecturale.git
   cd prject-3D
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm start
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:4200
   ```

### Autres commandes utiles

```bash
# Build de production
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## Structure du projet

```
prject-3D/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── scene3d/           # Composant principal 3D
│   │   │       ├── scene3d.ts     # Logique Three.js
│   │   │       ├── scene3d.html   # Template HTML
│   │   │       └── scene3d.css    # Styles CSS
│   │   ├── config/
│   │   │   └── building-config.ts # Configuration centralisée
│   │   ├── app.ts                 # Composant racine
│   │   └── app.html               # Template principal
│   ├── main.ts                    # Point d'entrée Angular
│   └── index.html                 # Page HTML principale
├── package.json                   # Dépendances et scripts
└── README.md                      # Ce fichier
```

## ⚙️ Configuration

### 🎯 **Fichier de configuration principal**

Le fichier `src/app/config/building-config.ts` centralise **toutes les données** du modèle 3D :

```typescript
// Exemple de configuration
export const BUILDING_CONFIG = {
  // Couleurs, dimensions, positions...
  mainWall: {
    color: 0xaaaaaa,              // Couleur du mur
    position: { x: 0, y: 0, z: 2.3 }, // Position dans l'espace
    openings: {
      door: {
        dimensions: { width: 1, height: 2.1, depth: 0.05 },
        color: 0x00ff00           // Porte verte
      }
    }
  }
  // ... autres configurations
};
```

### 🔧 **Avantages de cette approche**

- ✅ **Pas de valeurs en dur** dans le code
- ✅ **Modifications faciles** des propriétés
- ✅ **Code maintenable** et professionnel
- ✅ **Évolution simple** du projet

## Utilisation

### Navigation 3D

1. **Rotation de la vue**
   - Maintenez le **clic gauche** enfoncé
   - **Glissez** la souris pour faire tourner la caméra autour du bâtiment

2. **Zoom**
   - Utilisez la **molette de la souris**
   - Vers le haut = zoom avant
   - Vers le bas = zoom arrière

3. **Réinitialisation**
   - Cliquez sur le bouton **Réinitialiser Vue**
   - Remet la caméra à sa position initiale

### Interface utilisateur

L'interface affiche :
- **Informations sur les contrôles** (en haut à gauche)
- **Légende des couleurs** des éléments
- **Bouton de réinitialisation** de la vue

## Personnalisation

### Modifier les couleurs

Dans `building-config.ts`, changez les valeurs hexadécimales :

```typescript
// Exemples de couleurs
door: {
  color: 0xff0000,  // Rouge
  // color: 0x00ff00,  // Vert (actuel)
  // color: 0x0000ff,  // Bleu
}
```

### Redimensionner les éléments

```typescript
// Modifier les dimensions
door: {
  dimensions: { 
    width: 1.2,   // Plus large (était 1)
    height: 2.3,  // Plus haute (était 2.1)
    depth: 0.05 
  }
}
```

### Déplacer les éléments

```typescript
// Changer les positions
window1: {
  position: { 
    x: 0,     // Centré (était -0.5)
    y: 1.8,   // Plus haut (était 1.5)
    z: 2.3 
  }
}
```

### Ajuster l'éclairage

```typescript
lighting: {
  ambient: {
    intensity: 0.8  // Plus lumineux (était 0.6)
  },
  directional: {
    position: { x: 5, y: 15, z: 5 }  // Changer position du soleil
  }
}
```

## 📐 Architecture technique

### Composants principaux

1. **Scene3d** (`scene3d.ts`)
   - Initialisation de Three.js
   - Création des géométries 3D
   - Gestion des contrôles souris
   - Rendu et animation

2. **Building Config** (`building-config.ts`)
   - Configuration centralisée
   - Interfaces TypeScript
   - Fonctions utilitaires de calcul

### Technologies Three.js utilisées

- **Scene** : Conteneur 3D principal
- **PerspectiveCamera** : Caméra avec perspective réaliste
- **WebGLRenderer** : Rendu WebGL haute performance
- **Geometries** :
  - `BoxGeometry` : Murs, sol, toit simples
  - `ExtrudeGeometry` : Mur principal avec ouvertures
- **Materials** :
  - `MeshStandardMaterial` : Matériaux avec éclairage réaliste
- **Lights** :
  - `AmbientLight` : Lumière ambiante
  - `DirectionalLight` : Lumière directionnelle avec ombres

### Calculs automatiques

La classe `WallCalculations` génère automatiquement :
- Les coordonnées des ouvertures de portes
- Les coordonnées des ouvertures de fenêtres
- Les découpes dans le mur principal

## Développement

### Ajouter un nouvel élément

1. **Définir l'interface** dans `building-config.ts`
2. **Ajouter la configuration** dans `BUILDING_CONFIG`
3. **Créer la méthode de création** dans `scene3d.ts`
4. **Appeler la méthode** dans `ngOnInit()`


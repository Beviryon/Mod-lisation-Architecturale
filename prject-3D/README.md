﻿# ModÃ©lisation Architecturale 3D

Un projet de visualisation 3D d'un bÃ¢timent architectural dÃ©veloppÃ© avec **Angular** et **Three.js**.

## ðŸ“‹ Table des matiÃ¨res

- [ðŸŽ¯ Description](#-description)
- [âœ¨ FonctionnalitÃ©s](#-fonctionnalitÃ©s)
- [ðŸ› ï¸ Technologies utilisÃ©es](#ï¸-technologies-utilisÃ©es)
- [ðŸš€ Installation et lancement](#-installation-et-lancement)
- [ðŸ“ Structure du projet](#-structure-du-projet)
- [âš™ï¸ Configuration](#ï¸-configuration)
- [ðŸŽ® Utilisation](#-utilisation)
- [ðŸŽ¨ Personnalisation](#-personnalisation)
- [ðŸ“ Architecture technique](#-architecture-technique)
- [ðŸ”§ DÃ©veloppement](#-dÃ©veloppement)

## ðŸŽ¯ Description

Ce projet prÃ©sente un **modÃ¨le 3D interactif** d'un bÃ¢timent architectural simple comprenant :

- 4 murs formant une structure rectangulaire
- 1 porte d'entrÃ©e
- 2 fenÃªtres de tailles diffÃ©rentes
- Un toit et un sol
- Un systÃ¨me d'axes de rÃ©fÃ©rence

Le modÃ¨le est entiÃ¨rement **interactif** avec des contrÃ´les souris pour la navigation 3D.

## âœ¨ FonctionnalitÃ©s

### ðŸŽ® **ContrÃ´les interactifs**

- **Rotation** : Clic gauche + glisser pour faire tourner la vue
- **Zoom** : Molette de la souris pour zoomer/dÃ©zoomer
- **RÃ©initialisation** : Bouton pour revenir Ã  la vue initiale

### ðŸ  **Ã‰lÃ©ments architecturaux**

- **Mur principal** : FaÃ§ade avec ouvertures rÃ©elles (ExtrudeGeometry)
- **Murs latÃ©raux** : Murs pleins gauche, droit et arriÃ¨re
- **Ouvertures** : Porte verte et fenÃªtres rouges
- **Structure** : Sol marron et toit bleu
- **RepÃ¨res** : Axes X, Y, Z avec marqueurs colorÃ©s

### ðŸ’¡ **Ã‰clairage rÃ©aliste**

- **LumiÃ¨re ambiante** : Ã‰clairage gÃ©nÃ©ral doux
- **LumiÃ¨re directionnelle** : Simulation du soleil avec ombres
- **Ombres portÃ©es** : Rendu rÃ©aliste des ombres

## ðŸ› ï¸ Technologies utilisÃ©es

- **[Angular 19](https://angular.dev/)** - Framework web moderne
- **[Three.js](https://threejs.org/)** - BibliothÃ¨que 3D WebGL
- **[TypeScript](https://www.typescriptlang.org/)** - Langage de programmation typÃ©
- **[Vite](https://vitejs.dev/)** - Outil de build rapide
- **HTML5 & CSS3** - Structure et style

## ðŸš€ Installation et lancement

### PrÃ©requis

- **Node.js** (version 18 ou supÃ©rieure)
- **npm** (inclus avec Node.js)

### Ã‰tapes d'installation

1. **Cloner le projet**

   ```bash
   git clone https://github.com/Beviryon/Mod-lisation-Architecturale.git
   cd prject-3D
   ```

2. **Installer les dÃ©pendances**

   ```bash
   npm install
   ```

3. **Lancer le serveur de dÃ©veloppement**

   ```bash
   npm start
   ```

4. **Ouvrir dans le navigateur**

   ```text
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

## ðŸ“ Structure du projet

```text
prject-3D/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â””â”€â”€ scene3d/           # Composant principal 3D
â”‚   â”‚   â”‚       â”œâ”€â”€ scene3d.ts     # Logique Three.js
â”‚   â”‚   â”‚       â”œâ”€â”€ scene3d.html   # Template HTML
â”‚   â”‚   â”‚       â””â”€â”€ scene3d.css    # Styles CSS
â”‚   â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”‚   â””â”€â”€ building-config.ts # Configuration centralisÃ©e
â”‚   â”‚   â”œâ”€â”€ app.ts                 # Composant racine
â”‚   â”‚   â””â”€â”€ app.html               # Template principal
â”‚   â”œâ”€â”€ main.ts                    # Point d'entrÃ©e Angular
â”‚   â””â”€â”€ index.html                 # Page HTML principale
â”œâ”€â”€ package.json                   # DÃ©pendances et scripts
â””â”€â”€ README.md                      # Ce fichier
```

## âš™ï¸ Configuration

### ðŸŽ¯ **Fichier de configuration principal**

Le fichier `src/app/config/building-config.ts` centralise **toutes les donnÃ©es** du modÃ¨le 3D :

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

### ðŸ”§ **Avantages de cette approche**

- âœ… **Pas de valeurs en dur** dans le code
- âœ… **Modifications faciles** des propriÃ©tÃ©s
- âœ… **Code maintenable** et professionnel
- âœ… **Ã‰volution simple** du projet

## ðŸŽ® Utilisation

### Navigation 3D

1. **Rotation de la vue**
   - Maintenez le **clic gauche** enfoncÃ©
   - **Glissez** la souris pour faire tourner la camÃ©ra autour du bÃ¢timent

2. **Zoom**
   - Utilisez la **molette de la souris**
   - Vers le haut = zoom avant
   - Vers le bas = zoom arriÃ¨re

3. **RÃ©initialisation**
   - Cliquez sur le bouton **RÃ©initialiser Vue**
   - Remet la camÃ©ra Ã  sa position initiale

### Interface utilisateur

L'interface affiche :

- **Informations sur les contrÃ´les** (en haut Ã  gauche)
- **LÃ©gende des couleurs** des Ã©lÃ©ments
- **Bouton de rÃ©initialisation** de la vue

## ðŸŽ¨ Personnalisation

### Modifier les couleurs

Dans `building-config.ts`, changez les valeurs hexadÃ©cimales :

```typescript
// Exemples de couleurs
door: {
  color: 0xff0000,  // Rouge
  // color: 0x00ff00,  // Vert (actuel)
  // color: 0x0000ff,  // Bleu
}
```

### Redimensionner les Ã©lÃ©ments

```typescript
// Modifier les dimensions
door: {
  dimensions: { 
    width: 1.2,   // Plus large (Ã©tait 1)
    height: 2.3,  // Plus haute (Ã©tait 2.1)
    depth: 0.05 
  }
}
```

### DÃ©placer les Ã©lÃ©ments

```typescript
// Changer les positions
window1: {
  position: { 
    x: 0,     // CentrÃ© (Ã©tait -0.5)
    y: 1.8,   // Plus haut (Ã©tait 1.5)
    z: 2.3 
  }
}
```

### Ajuster l'Ã©clairage

```typescript
lighting: {
  ambient: {
    intensity: 0.8  // Plus lumineux (Ã©tait 0.6)
  },
  directional: {
    position: { x: 5, y: 15, z: 5 }  // Changer position du soleil
  }
}
```

## ðŸ“ Architecture technique

### Composants principaux

1. **Scene3d** (`scene3d.ts`)
   - Initialisation de Three.js
   - CrÃ©ation des gÃ©omÃ©tries 3D
   - Gestion des contrÃ´les souris
   - Rendu et animation

2. **Building Config** (`building-config.ts`)
   - Configuration centralisÃ©e
   - Interfaces TypeScript
   - Fonctions utilitaires de calcul

### Technologies Three.js utilisÃ©es

- **Scene** : Conteneur 3D principal
- **PerspectiveCamera** : CamÃ©ra avec perspective rÃ©aliste
- **WebGLRenderer** : Rendu WebGL haute performance
- **Geometries** :
  - `BoxGeometry` : Murs, sol, toit simples
  - `ExtrudeGeometry` : Mur principal avec ouvertures
- **Materials** :
  - `MeshStandardMaterial` : MatÃ©riaux avec Ã©clairage rÃ©aliste
- **Lights** :
  - `AmbientLight` : LumiÃ¨re ambiante
  - `DirectionalLight` : LumiÃ¨re directionnelle avec ombres

### Calculs automatiques

La classe `WallCalculations` gÃ©nÃ¨re automatiquement :

- Les coordonnÃ©es des ouvertures de portes
- Les coordonnÃ©es des ouvertures de fenÃªtres
- Les dÃ©coupes dans le mur principal

## ðŸ”§ DÃ©veloppement

### Ajouter un nouvel Ã©lÃ©ment

1. **DÃ©finir l'interface** dans `building-config.ts`
2. **Ajouter la configuration** dans `BUILDING_CONFIG`
3. **CrÃ©er la mÃ©thode de crÃ©ation** dans `scene3d.ts`
4. **Appeler la mÃ©thode** dans `ngOnInit()`
 
 


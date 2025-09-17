# 🏗️ Projet 3D - Modélisation Architecturale

## 📋 Description

Ce projet est une application web de modélisation 3D architecturale développée avec **Angular 20** et **Three.js**. Il permet de visualiser une construction complète avec des murs, des ouvertures (portes et fenêtres), et des sols selon des spécifications architecturales précises.

## 🎯 Fonctionnalités

- **Modélisation 3D interactive** avec rotation automatique de la caméra
- **Géométrie architecturale complète** selon les spécifications du projet
- **Couleurs conformes** : murs gris, porte verte, fenêtres rouges
- **Dimensions exactes** : hauteur des murs 2.5m, épaisseur 0.20m
- **Interface responsive** avec panneau d'information
- **Éclairage réaliste** avec ombres et effets de lumière
- **Compatible SSR** (Server-Side Rendering)

## 🛠️ Technologies Utilisées

- **Angular 20** - Framework frontend avec signals et zoneless change detection
- **Three.js** - Bibliothèque JavaScript pour la 3D et WebGL
- **TypeScript** - Langage de programmation typé
- **CSS3** - Styles modernes et responsive
- **SSR** - Rendu côté serveur pour de meilleures performances

## 📐 Spécifications Architecturales

### Paramètres Généraux
- **Hauteur des murs** : 2.5m
- **Épaisseur** : 0.20m

### Contour des Murs
- **Point 1** : (0, 0, 0)
- **Point 2** : (5, 0, 0)
- **Point 3** : (5, 8, 0)
- **Point 4** : (0, 8, 0)

### Ouvertures

#### Fenêtre S1 (Rouge)
- **Position** : x=2, y=0, z=0.9
- **Dimensions** : b=1.5m, h=1.2m, ep=0.05m

#### Fenêtre S2 (Rouge)
- **Position** : x=5, y=3, z=0.9
- **Dimensions** : b=0.9m, h=1.2m, ep=0.05m

#### Porte P1 (Verte)
- **Position** : x=0, y=3.5, z=0
- **Dimensions** : b=1m, h=2.1m, ep=0.05m

### Sols

#### Sol1 (Sol de base)
- **Épaisseur** : 0.2m
- **Position Z** : 0
- **Contour** : (0,-2), (5,2), (5,8), (0,0)

#### Plancher (Plafond)
- **Épaisseur** : 0.2m
- **Position Z** : 2.7m
- **Contour** : (0,0), (6,0), (6,8), (0,8)

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Démarrage du serveur de développement
```bash
npm start
```

L'application sera accessible à l'adresse : `http://localhost:4200`

### Build de production
```bash
npm run build
```

### Tests
```bash
npm test
```

## 📁 Structure du Projet

```
prject-3D/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── scene3d/
│   │   │       ├── scene3d.ts      # Logique Three.js
│   │   │       ├── scene3d.html    # Template 3D
│   │   │       └── scene3d.css    # Styles 3D
│   │   ├── app.ts                  # Composant principal
│   │   ├── app.html               # Template principal
│   │   ├── app.css                # Styles globaux
│   │   └── app.config.ts          # Configuration Angular
│   ├── main.ts                    # Point d'entrée
│   └── index.html                 # HTML principal
├── package.json                   # Dépendances
├── angular.json                   # Configuration Angular CLI
└── README.md                      # Documentation
```

## 🎮 Utilisation

1. **Démarrez l'application** avec `npm start`
2. **Ouvrez votre navigateur** à l'adresse `http://localhost:4200`
3. **Visualisez la modélisation 3D** avec :
   - Rotation automatique de la caméra
   - Panneau d'information à droite
   - Géométrie architecturale complète

## 🎨 Couleurs et Matériaux

- **Murs** : Gris (`#808080`) - Matériau Lambert
- **Porte** : Vert (`#00ff00`) - Matériau Lambert
- **Fenêtres** : Rouge (`#ff0000`) - Matériau Lambert
- **Sol** : Marron (`#8B4513`) - Matériau Lambert
- **Plafond** : Beige (`#DEB887`) - Matériau Lambert

## 🔧 Configuration Technique

### Gestion SSR
Le projet est compatible avec le Server-Side Rendering d'Angular. Three.js ne s'initialise que côté client grâce à la vérification `isPlatformBrowser()`.

### Performance
- **Bundle size** : ~724kB (inclut Three.js)
- **Rendu** : WebGL avec antialiasing
- **Ombres** : PCF Soft Shadow Map
- **Animation** : 60 FPS avec `requestAnimationFrame`

### Éclairage
- **Lumière ambiante** : `#404040` (intensité 0.6)
- **Lumière directionnelle** : `#ffffff` (intensité 0.8)
- **Ombres** : Activées avec résolution 2048x2048

## 🐛 Résolution de Problèmes

### Erreur "document is not defined"
Cette erreur peut survenir lors du build SSR. Elle est résolue par la vérification `isPlatformBrowser()` dans le composant.

### Bundle size warning
Le bundle dépasse le budget de 500kB à cause de Three.js. C'est normal pour une application 3D.

### Performance sur mobile
Pour de meilleures performances sur mobile, considérez réduire la résolution des ombres ou désactiver certains effets.

## 📝 Développement

### Ajout de nouvelles géométries
1. Créez une nouvelle méthode dans `scene3d.ts`
2. Utilisez `THREE.BoxGeometry` pour les formes simples
3. Ajoutez le mesh à la scène avec `this.scene.add(mesh)`

### Modification des couleurs
Modifiez les valeurs hexadécimales dans les matériaux Three.js :
```typescript
const material = new THREE.MeshLambertMaterial({ color: 0x808080 });
```

### Ajout d'interactions
Utilisez les événements Three.js pour ajouter des contrôles de caméra ou des interactions avec les objets.

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique de modélisation 3D architecturale.

## 👨‍💻 Auteur

Développé avec Angular 20 et Three.js pour la modélisation architecturale interactive.

---

**Note** : Ce projet respecte scrupuleusement les spécifications architecturales fournies et implémente une visualisation 3D complète et interactive.
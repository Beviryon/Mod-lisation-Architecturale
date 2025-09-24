# 🏗️ Modélisation Architecturale 3D

Application Angular avec Three.js pour la modélisation et visualisation de bâtiments en 3D.

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement de l'application
ng serve

# Accès à l'application
http://localhost:4200
```

## ✨ Fonctionnalités Principales

### 🏠 Modélisation 3D
- **Bâtiment complet** : Murs, toit, sol, ouvertures
- **Modifications en temps réel** : Dimensions, couleurs, positions
- **Calculateur de fenêtres** : Ajout automatique d'ouvertures
- **Interface intuitive** : Contrôles visuels et sliders

### 🎨 Personnalisation
- **Couleurs interactives** : Sélecteur de couleurs pour chaque élément
- **Dimensions flexibles** : Modification des tailles en temps réel
- **Configuration directe** : Édition du fichier `building-config.ts`

### 🧮 Outils Avancés
- **Calculateur de fenêtres** : Calcul automatique du nombre d'ouvertures
- **Validation en temps réel** : Vérification des contraintes architecturales
- **Export/Import** : Sauvegarde des configurations

## 📁 Structure du Projet

```
src/
├── app/
│   ├── components/
│   │   ├── scene3d/           # Composant principal 3D
│   │   └── calculateur-fenetres/ # Calculateur d'ouvertures
│   ├── services/              # Services métier
│   ├── config/
│   │   └── building-config.ts # Configuration du bâtiment
│   └── app.ts                 # Composant racine
├── assets/                    # Ressources statiques
└── styles/                    # Styles globaux
```

## 🎯 Utilisation

### 1. Interface Principale
- **Barre latérale gauche** : Contrôles et outils
- **Zone centrale** : Visualisation 3D interactive
- **Boutons de modification** : Dimensions, couleurs, ouvertures

### 2. Modification du Bâtiment
- **Dimensions** : Sliders pour longueur, largeur, hauteur
- **Couleurs** : Sélecteur de couleurs pour chaque élément
- **Ouvertures** : Ajout/suppression de fenêtres et portes

### 3. Calculateur de Fenêtres
- **Sélection du mur** : Choisir le mur à modifier
- **Paramètres** : Taille, écart, nombre de fenêtres
- **Application** : Ajout automatique des ouvertures

## 🔧 Configuration

### Fichier `building-config.ts`
```typescript
export const BUILDING_CONFIG = {
  // Dimensions du bâtiment
  dimensions: { longueur: 8, largeur: 5, hauteur: 2.5 },
  
  // Configuration des murs
  murs: {
    principal: { /* ... */ },
    arriere: { /* ... */ },
    gauche: { /* ... */ },
    droit: { /* ... */ }
  },
  
  // Ouvertures (fenêtres et portes)
  ouvertures: { /* ... */ }
};
```

### Modification Directe
1. Éditez `src/app/config/building-config.ts`
2. Cliquez sur "🔄 Recharger Configuration"
3. Les changements s'appliquent immédiatement

## 🛠️ Technologies

- **Angular 17+** : Framework frontend
- **Three.js** : Rendu 3D
- **TypeScript** : Langage de développement
- **RxJS** : Programmation réactive
- **CSS3** : Styles et animations

## 📚 Documentation

- **[Guide de Navigation](./Documentations/NAVIGATION.md)** : Navigation dans l'interface
- **[Guide de Test de Scène](./Documentations/GUIDE-TEST-SCENE.md)** : Tests et diagnostics
- **[Documentation Complète](./Documentations/README.md)** : Guide détaillé

## 🐛 Dépannage

### Problèmes Courants
- **Scène 3D ne se charge pas** : Vérifiez la console, redémarrez l'application
- **Modifications non visibles** : Cliquez sur "Recharger Configuration"
- **Erreurs de compilation** : Vérifiez `building-config.ts` pour les erreurs de syntaxe

### Console de Développement
Ouvrez F12 pour voir :
- Messages de log détaillés
- Erreurs de compilation
- État des services

## 🚀 Développement

### Commandes Utiles
```bash
# Compilation
ng build

# Tests
ng test

# Linting
ng lint

# Génération de composant
ng generate component nom-composant
```

### Structure des Services
- `ConfigurationService` : Gestion de la configuration
- `SceneService` : Gestion de la scène 3D
- `CalculateurFenetresService` : Calcul des ouvertures

## 📄 Licence

Projet éducatif - Utilisation libre pour l'apprentissage.

---

*Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}*
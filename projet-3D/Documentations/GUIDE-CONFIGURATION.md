# ⚙️ Guide de Configuration - building-config.ts

## 🎯 Vue d'Ensemble

Le fichier `building-config.ts` est le cœur de votre application. Il contient toute la configuration du bâtiment 3D et peut être modifié directement pour des changements permanents.

## 📁 Localisation

```
src/app/config/building-config.ts
```

## 🏗️ Structure de la Configuration

### Configuration Principale
```typescript
export const BUILDING_CONFIG = {
  // Dimensions globales du bâtiment
  dimensions: {
    longueur: 8,    // Longueur en mètres
    largeur: 5,     // Largeur en mètres
    hauteur: 2.5    // Hauteur en mètres
  },
  
  // Configuration des murs
  murs: {
    principal: { /* ... */ },
    arriere: { /* ... */ },
    gauche: { /* ... */ },
    droit: { /* ... */ }
  },
  
  // Configuration du toit
  toit: { /* ... */ },
  
  // Configuration du sol
  sol: { /* ... */ }
};
```

## 🧱 Configuration des Murs

### Structure d'un Mur
```typescript
principal: {
  position: { x: 0, y: 0, z: 2.3 },           // Position 3D
  dimensions: { width: 8, height: 2.5, depth: 0.2 }, // Dimensions
  color: 0xaaaaaa,                            // Couleur (hex)
  ouvertures: {                               // Ouvertures du mur
    door: { /* ... */ },
    window1: { /* ... */ },
    window2: { /* ... */ }
  }
}
```

### Types de Murs
- **principal** : Façade avant
- **arriere** : Façade arrière
- **gauche** : Mur latéral gauche
- **droit** : Mur latéral droit

## 🚪 Configuration des Ouvertures

### Structure d'une Ouverture
```typescript
door: {
  position: { x: 0, y: 0.5, z: 2.3 },        // Position relative au mur
  dimensions: { width: 1, height: 2, depth: 0.05 }, // Dimensions
  color: 0x00ff00,                           // Couleur (vert pour porte)
  type: 'door' as const                       // Type : 'door' ou 'window'
}
```

### Types d'Ouvertures
- **door** : Porte (couleur verte par défaut)
- **window** : Fenêtre (couleur rouge par défaut)

### Exemple Complet d'Ouvertures
```typescript
ouvertures: {
  // Porte centrale
  door: {
    position: { x: 0, y: 0.5, z: 2.3 },
    dimensions: { width: 1, height: 2, depth: 0.05 },
    color: 0x00ff00,        // Vert
    type: 'door' as const
  },
  
  // Fenêtre gauche
  window1: {
    position: { x: -2, y: 1.5, z: 2.3 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,        // Rouge
    type: 'window' as const
  },
  
  // Fenêtre droite
  window2: {
    position: { x: 2, y: 1.5, z: 2.3 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,        // Rouge
    type: 'window' as const
  }
}
```

## 🎨 Couleurs

### Format des Couleurs
- **Hexadécimal** : `0xRRGGBB`
- **Exemples** :
  - `0xff0000` : Rouge
  - `0x00ff00` : Vert
  - `0x0000ff` : Bleu
  - `0xaaaaaa` : Gris clair
  - `0x8B4513` : Marron

### Couleurs Recommandées
```typescript
// Murs
color: 0xaaaaaa,        // Gris clair
color: 0x8B4513,        // Marron
color: 0xffffff,        // Blanc

// Portes
color: 0x00ff00,        // Vert
color: 0x8B4513,        // Marron
color: 0x000000,        // Noir

// Fenêtres
color: 0xff0000,        // Rouge (vitrage)
color: 0x87CEEB,        // Bleu ciel
color: 0xffff00,        // Jaune
```

## 📐 Dimensions

### Unités
- **Toutes les dimensions** sont en mètres
- **Précision** : Décimale (ex: 1.5m, 2.3m)

### Dimensions Typiques
```typescript
// Murs
dimensions: { width: 8, height: 2.5, depth: 0.2 }    // 8m × 2.5m × 20cm

// Portes
dimensions: { width: 1, height: 2, depth: 0.05 }     // 1m × 2m × 5cm

// Fenêtres
dimensions: { width: 1.5, height: 1.2, depth: 0.05 } // 1.5m × 1.2m × 5cm
```

## 🔧 Modification de la Configuration

### Étape 1 : Édition
1. Ouvrez `src/app/config/building-config.ts`
2. Modifiez les valeurs souhaitées
3. Sauvegardez le fichier

### Étape 2 : Application
1. Retournez à l'application
2. Cliquez sur **"🔄 Recharger Configuration"**
3. Les changements s'appliquent immédiatement

### Exemple de Modification
```typescript
// Avant
dimensions: { longueur: 8, largeur: 5, hauteur: 2.5 }

// Après
dimensions: { longueur: 12, largeur: 8, hauteur: 3 }
```

## 🏠 Exemples de Configurations

### Maison Familiale
```typescript
dimensions: { longueur: 12, largeur: 8, hauteur: 3 },
murs: {
  principal: {
    color: 0x8B4513,  // Marron
    ouvertures: {
      door: { color: 0x000000 },      // Porte noire
      window1: { color: 0x87CEEB },   // Fenêtre bleue
      window2: { color: 0x87CEEB }    // Fenêtre bleue
    }
  }
}
```

### Bureau Moderne
```typescript
dimensions: { longueur: 15, largeur: 10, hauteur: 3.5 },
murs: {
  principal: {
    color: 0xffffff,  // Blanc
    ouvertures: {
      door: { color: 0x696969 },      // Porte grise
      window1: { color: 0x0000ff },   // Fenêtre bleue
      window2: { color: 0x0000ff }    // Fenêtre bleue
    }
  }
}
```

### Petit Bâtiment
```typescript
dimensions: { longueur: 6, largeur: 4, hauteur: 2.5 },
murs: {
  principal: {
    color: 0xffa500,  // Orange
    ouvertures: {
      door: { color: 0x8B4513 },      // Porte marron
      window1: { color: 0xffff00 }    // Fenêtre jaune
    }
  }
}
```

## ⚠️ Points d'Attention

### Types Corrects
```typescript
// ✅ Correct
type: 'door' as const
type: 'window' as const

// ❌ Incorrect
type: 'porte'        // Mauvais type
type: 'fenetre'      // Mauvais type
```

### Positions Cohérentes
```typescript
// ✅ Position logique
position: { x: 0, y: 1.5, z: 2.3 }    // Centré, à hauteur normale

// ❌ Position illogique
position: { x: 0, y: 5, z: 2.3 }      // Trop haut
position: { x: 0, y: -1, z: 2.3 }     // Sous le sol
```

### Dimensions Réalistes
```typescript
// ✅ Dimensions réalistes
dimensions: { width: 1, height: 2, depth: 0.05 }    // Porte normale

// ❌ Dimensions irréalistes
dimensions: { width: 0.1, height: 0.1, depth: 0.01 } // Trop petit
dimensions: { width: 10, height: 10, depth: 1 }      // Trop grand
```

## 🔍 Validation

### Vérifications Automatiques
- **Types** : Vérification des types d'ouvertures
- **Dimensions** : Validation des tailles
- **Positions** : Vérification de la cohérence spatiale
- **Couleurs** : Validation du format hexadécimal

### Messages d'Erreur
- **"Type invalide"** : Utilisez 'door' ou 'window'
- **"Position invalide"** : Vérifiez les coordonnées
- **"Dimensions invalides"** : Vérifiez les tailles

## 🚀 Conseils

### Bonnes Pratiques
1. **Sauvegardez** avant de modifier
2. **Testez** les modifications une par une
3. **Validez** avec le bouton de rechargement
4. **Documentez** vos configurations personnalisées

### Optimisation
- **Cohérence** : Utilisez des couleurs harmonieuses
- **Réalisme** : Respectez les proportions architecturales
- **Performance** : Évitez les configurations trop complexes

---

*Guide de configuration mis à jour le : {{ new Date().toLocaleDateString('fr-FR') }}*

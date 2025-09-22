# 🧮 Calculateur de Fenêtres Intelligent

## 🎯 Fonctionnalités

Votre application dispose maintenant d'un **Calculateur de Fenêtres Intelligent** qui vous permet de :

### ✅ **Calculs Automatiques**
- **Nombre maximum de fenêtres** qu'un mur peut contenir
- **Positions optimales** pour chaque fenêtre
- **Validation des contraintes** d'espacement
- **Optimisation des dimensions** automatique

### ✅ **Interface Intuitive**
- Sélection du mur à analyser
- Paramètres ajustables en temps réel
- Résultats visuels et détaillés
- Génération automatique de la configuration

## 🚀 Comment Utiliser

### 1. **Accéder au Calculateur**
```
http://localhost:4200/calculateur
```

### 2. **Sélectionner un Mur**
Choisissez parmi :
- **Mur Principal (Façade)** : 8m × 2.5m
- **Mur Arrière** : 8m × 2.5m  
- **Mur Gauche** : 5m × 2.5m
- **Mur Droit** : 5m × 2.5m

### 3. **Ajuster les Paramètres**
- **Largeur des fenêtres** : 0.5m à 3.0m
- **Hauteur des fenêtres** : 0.8m à 2.5m
- **Écart entre fenêtres** : 0.1m à 2.0m
- **Nombre souhaité** : 0 à 20 fenêtres

### 4. **Analyser les Résultats**
Le calculateur affiche :
- ✅ **Nombre maximum possible** de fenêtres
- 📏 **Largeur totale utilisée**
- 📐 **Marge restante** sur le mur
- 📍 **Positions calculées** pour chaque fenêtre

### 5. **Générer la Configuration**
- Cliquez sur **"Générer la Configuration"**
- Copiez le code généré
- Collez-le dans `building-config.ts`

## 📊 Exemples Pratiques

### **Mur Principal (8m × 2.5m)**
```
Fenêtres de 1.5m avec écart de 0.5m :
→ Maximum : 4 fenêtres
→ Largeur utilisée : 6.5m
→ Marge restante : 1.5m
```

### **Mur Gauche (5m × 2.5m)**
```
Fenêtres de 1.2m avec écart de 0.3m :
→ Maximum : 3 fenêtres
→ Largeur utilisée : 4.2m
→ Marge restante : 0.8m
```

## ⚙️ Fonctionnalités Avancées

### **Optimisation Automatique**
- Cliquez sur **"Optimiser les Dimensions"**
- Le système calcule les dimensions optimales
- Ajuste automatiquement largeur et écart

### **Validation Intelligente**
- Vérifie les contraintes d'espacement
- Valide les dimensions des fenêtres
- Affiche des messages d'erreur explicites

### **Génération de Code**
- Code TypeScript prêt à utiliser
- Positions calculées automatiquement
- Format compatible avec `building-config.ts`

## 🔧 Contraintes Techniques

### **Limites par Défaut**
- **Largeur fenêtre** : 0.5m - 3.0m
- **Hauteur fenêtre** : 0.8m - 2.5m
- **Écart minimum** : 0.1m
- **Marge mur** : 0.2m minimum

### **Validation Automatique**
- ✅ Fenêtre rentre dans le mur
- ✅ Écart respecté entre fenêtres
- ✅ Marges suffisantes
- ✅ Dimensions réalistes

## 📝 Exemple de Configuration Générée

```typescript
openings: {
  window1: {
    position: { x: -2.50, y: 1.25, z: 2.30 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,
    type: 'window' as const
  },
  window2: {
    position: { x: -0.50, y: 1.25, z: 2.30 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,
    type: 'window' as const
  },
  window3: {
    position: { x: 1.50, y: 1.25, z: 2.30 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,
    type: 'window' as const
  }
}
```

## 🎨 Personnalisation

### **Couleurs des Fenêtres**
Modifiez la couleur dans le code généré :
```typescript
color: 0xff0000,  // Rouge
color: 0x0066cc,  // Bleu
color: 0x00cc66,  // Vert
color: 0xff6600,  // Orange
```

### **Types d'Ouvertures**
```typescript
type: 'window' as const  // Fenêtre
type: 'door' as const    // Porte
```

## 🚀 Prochaines Étapes

1. **Testez le calculateur** sur différents murs
2. **Générez des configurations** pour vos projets
3. **Intégrez les résultats** dans `building-config.ts`
4. **Rechargez la configuration** dans l'application 3D

Le calculateur vous fait gagner du temps et évite les erreurs de calcul manuel ! 🎯

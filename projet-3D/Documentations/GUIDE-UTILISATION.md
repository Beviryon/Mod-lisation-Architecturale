# 🎯 Guide d'Utilisation - Modélisation Architecturale 3D

## 🚀 Démarrage Rapide

### 1. Lancer l'Application
```bash
npm install
ng serve
```
Accédez à `http://localhost:4200`

### 2. Interface Principale
- **Zone 3D centrale** : Visualisation du bâtiment
- **Barre latérale gauche** : Contrôles et outils
- **Boutons de modification** : Dimensions, couleurs, ouvertures

## 🏠 Modification du Bâtiment

### Dimensions Globales
1. Cliquez sur **"📏 Dimensions Temps Réel"**
2. Ajustez les sliders : Longueur, Largeur, Hauteur
3. Les changements s'appliquent en temps réel

### Couleurs des Éléments
1. Cliquez sur **"🧪 Test des Services"**
2. Utilisez le **Sélecteur de Couleurs**
3. Cliquez sur l'élément à colorier (mur, fenêtre, porte)

### Ajout de Fenêtres
1. Cliquez sur **"🧮 Calculateur Fenêtres"**
2. Sélectionnez le mur
3. Choisissez la taille et l'écart
4. Cliquez sur **"✅ Appliquer Configuration"**

## 🔧 Configuration Directe

### Modifier building-config.ts
1. Éditez `src/app/config/building-config.ts`
2. Modifiez les dimensions, couleurs, ouvertures
3. Cliquez sur **"🔄 Recharger Configuration"**

### Exemple de Modification
```typescript
// Dans building-config.ts
walls: {
  back: {
    dimensions: { width: 12, height: 3, depth: 0.2 }, // Plus grand
    color: 0x00ff00, // Vert
  }
}
```

## 🧮 Calculateur de Fenêtres

### Fonctionnalités
- **Calcul automatique** : Nombre de fenêtres possibles
- **Tailles prédéfinies** : Petit, Moyen, Grand
- **Positionnement optimal** : Répartition automatique
- **Contraintes** : Respect des marges et espacements

### Utilisation
1. **Sélectionnez un mur** : Principal, Arrière, Gauche, Droit
2. **Choisissez la taille** : Petit (0.8m×1.0m), Moyen (1.5m×1.2m), Grand (2.5m×1.8m)
3. **Ajustez l'écart** : Espacement entre fenêtres
4. **Vérifiez la capacité** : Nombre de fenêtres possibles
5. **Appliquez** : Les fenêtres sont ajoutées automatiquement

## 🎨 Personnalisation Avancée

### Sélecteur de Couleurs
- **Palette complète** : Toutes les couleurs disponibles
- **Application immédiate** : Changement en temps réel
- **Éléments individuels** : Chaque mur/fenêtre/porte séparément

### Modifications en Temps Réel
- **Activation/Désactivation** : Contrôle du temps réel
- **Application manuelle** : Bouton pour appliquer les changements
- **Synchronisation** : Données cohérentes entre interface et modèle 3D

## 🔍 Tests et Diagnostics

### Test de la Scène 3D
1. Cliquez sur **"🧪 Test des Services"**
2. Cliquez sur **"🎬 Test Scène"**
3. Vérifiez que tous les objets sont créés

### Validation
- **Score de qualité** : Note de 0 à 100
- **Détection d'erreurs** : Problèmes critiques
- **Avertissements** : Problèmes mineurs

## 🐛 Dépannage

### Problèmes Courants

#### Scène 3D ne se charge pas
- **Solution** : Redémarrez l'application
- **Vérification** : Console du navigateur (F12)

#### Modifications non visibles
- **Solution** : Cliquez sur "🔄 Recharger Configuration"
- **Vérification** : Temps réel activé

#### Erreurs de compilation
- **Solution** : Vérifiez `building-config.ts` pour les erreurs de syntaxe
- **Vérification** : Types corrects (`'door' as const`, `'window' as const`)

### Console de Développement
Ouvrez F12 pour voir :
- Messages de log détaillés
- Erreurs de compilation
- État des services
- Statistiques de rendu

## 📊 Exemples d'Utilisation

### Maison Familiale
```
Dimensions : 12m × 8m × 3m
Murs : Couleurs chaudes (beige, marron)
Fenêtres : Moyennes, écart 1m
Porte : Centrale, 1m × 2.1m
```

### Bureau Moderne
```
Dimensions : 15m × 10m × 3.5m
Murs : Couleurs neutres (gris, blanc)
Fenêtres : Grandes, écart 0.5m
Portes : Multiples, 0.9m × 2.1m
```

### Petit Bâtiment
```
Dimensions : 6m × 4m × 2.5m
Murs : Couleurs vives
Fenêtres : Petites, écart 0.3m
Porte : Simple, 0.8m × 2m
```

## 🚀 Conseils d'Utilisation

### Performance
- **Modifications par lots** : Évitez les changements trop rapides
- **Rechargement** : Utilisez le bouton de rechargement si nécessaire
- **Validation** : Vérifiez régulièrement le score de qualité

### Design
- **Proportions** : Respectez les ratios architecturaux
- **Cohérence** : Utilisez des couleurs harmonieuses
- **Fonctionnalité** : Vérifiez que les ouvertures sont accessibles

### Développement
- **Configuration** : Modifiez `building-config.ts` pour des changements permanents
- **Tests** : Utilisez les outils de test pour valider les modifications
- **Documentation** : Consultez les guides pour les fonctionnalités avancées

---

*Guide d'utilisation mis à jour le : {{ new Date().toLocaleDateString('fr-FR') }}*

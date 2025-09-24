# 🧮 Guide du Calculateur de Fenêtres

## 🎯 Fonctionnalité

Le calculateur de fenêtres permet d'ajouter automatiquement des fenêtres sur n'importe quel mur en respectant les contraintes architecturales.

## 🚀 Accès

1. **Bouton principal** : "🧮 Calculateur Fenêtres" dans la barre latérale
2. **Interface dédiée** : Modal avec tous les contrôles
3. **Intégration** : Directement dans le composant Scene3D

## 🏠 Sélection du Mur

### Murs Disponibles
- **Mur Principal** : Façade avant (8m de large)
- **Mur Arrière** : Façade arrière (8m de large)
- **Mur Gauche** : Mur latéral gauche (5m de large)
- **Mur Droit** : Mur latéral droit (5m de large)

### Capacité de Chaque Mur
- **Murs Principal/Arrière** : Plus d'espace pour les fenêtres
- **Murs Latéraux** : Espace plus limité
- **Calcul automatique** : Le système calcule le nombre maximum possible

## 📏 Tailles de Fenêtres

### Tailles Prédéfinies
- **Petit** : 0.8m × 1.0m (fenêtres de service)
- **Moyen** : 1.5m × 1.2m (fenêtres standard)
- **Grand** : 2.5m × 1.8m (fenêtres panoramiques)

### Sélection de la Taille
1. **Menu déroulant** : Choisissez la taille souhaitée
2. **Calcul automatique** : Le nombre de fenêtres se met à jour
3. **Optimisation** : Le système trouve la meilleure répartition

## 📐 Paramètres de Configuration

### Écart entre Fenêtres
- **Plage** : 0.1m à 2.0m
- **Recommandé** : 0.5m à 1.0m
- **Effet** : Plus l'écart est grand, moins de fenêtres possibles

### Nombre de Fenêtres
- **Calcul automatique** : Basé sur la taille et l'écart
- **Contraintes** : Respect des marges minimales (0.2m)
- **Optimisation** : Répartition équilibrée

### Couleur des Fenêtres
- **Sélecteur** : Choisissez la couleur souhaitée
- **Application** : Toutes les fenêtres ajoutées auront cette couleur
- **Transparence** : Fenêtres semi-transparentes pour l'effet vitré

## 🔧 Utilisation Détaillée

### Étape 1 : Sélection du Mur
1. Cliquez sur **"🧮 Calculateur Fenêtres"**
2. Sélectionnez le mur dans le menu déroulant
3. La capacité se calcule automatiquement

### Étape 2 : Configuration
1. **Choisissez la taille** : Petit, Moyen, ou Grand
2. **Ajustez l'écart** : Glissez le slider ou saisissez une valeur
3. **Vérifiez le nombre** : Le système calcule le maximum possible
4. **Choisissez la couleur** : Utilisez le sélecteur de couleurs

### Étape 3 : Application
1. **Vérifiez la configuration** : Nombre de fenêtres, positions
2. **Cliquez sur "✅ Appliquer Configuration"**
3. **Observez le résultat** : Les fenêtres apparaissent sur le mur

## 📊 Exemples de Calculs

### Mur Principal (8m de large)
```
Taille Moyen (1.5m) + Écart 0.5m = 2m par fenêtre
Capacité : 8m ÷ 2m = 4 fenêtres maximum
Marge restante : 0m (parfait)
```

### Mur Latéral (5m de large)
```
Taille Petit (0.8m) + Écart 0.3m = 1.1m par fenêtre
Capacité : 5m ÷ 1.1m = 4 fenêtres maximum
Marge restante : 0.6m
```

### Mur avec Grande Fenêtre
```
Taille Grand (2.5m) + Écart 1m = 3.5m par fenêtre
Capacité : 8m ÷ 3.5m = 2 fenêtres maximum
Marge restante : 1m
```

## 🎨 Résultats Visuels

### Fenêtres Créées
- **Trous réels** : Ouvertures dans le mur avec ExtrudeGeometry
- **Objets colorés** : Fenêtres semi-transparentes dans les trous
- **Positionnement** : Répartition équilibrée sur le mur
- **Profondeur** : Fenêtres légèrement en avant du mur

### Effet Visuel
- **Transparence** : Opacité 0.3 pour l'effet vitré
- **Double face** : Visible des deux côtés
- **Éclairage** : Réagit à la lumière de la scène
- **Ombres** : Projette des ombres réalistes

## 🔍 Validation et Contraintes

### Contraintes Architecturales
- **Marge minimale** : 0.2m de chaque côté du mur
- **Hauteur minimale** : 1.0m pour les fenêtres
- **Largeur minimale** : 0.5m pour les fenêtres
- **Écart minimal** : 0.1m entre fenêtres

### Validation Automatique
- **Vérification** : Le système valide les contraintes
- **Messages** : Indication si la configuration est valide
- **Ajustement** : Suggestions d'optimisation

## 🐛 Dépannage

### Problèmes Courants

#### Aucune fenêtre possible
- **Cause** : Mur trop petit ou écart trop grand
- **Solution** : Réduisez l'écart ou choisissez une taille plus petite

#### Fenêtres mal positionnées
- **Cause** : Configuration incorrecte
- **Solution** : Rechargez la configuration et réessayez

#### Fenêtres non visibles
- **Cause** : Problème de rendu 3D
- **Solution** : Redémarrez l'application

### Messages d'Erreur
- **"Mur trop petit"** : Choisissez une taille plus petite
- **"Écart trop grand"** : Réduisez l'espacement
- **"Configuration invalide"** : Vérifiez les paramètres

## 🚀 Conseils d'Utilisation

### Pour de Meilleurs Résultats
1. **Commencez par la taille Moyen** : Bon compromis
2. **Utilisez un écart de 0.5m** : Standard architectural
3. **Vérifiez la capacité** : Assurez-vous qu'il y a assez d'espace
4. **Testez différentes tailles** : Trouvez le meilleur équilibre

### Optimisation
- **Murs larges** : Utilisez des fenêtres grandes
- **Murs étroits** : Utilisez des fenêtres petites
- **Éclairage** : Plus de fenêtres = plus de lumière
- **Esthétique** : Équilibrez le nombre et la taille

---

*Guide du calculateur de fenêtres mis à jour le : {{ new Date().toLocaleDateString('fr-FR') }}*

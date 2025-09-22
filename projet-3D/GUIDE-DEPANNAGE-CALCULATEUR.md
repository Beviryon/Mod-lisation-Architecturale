# 🔧 Guide de Dépannage - Calculateur de Fenêtres

## 🚨 Problèmes Courants et Solutions

### 1. **Le bouton "🧮 Calculateur Fenêtres" n'apparaît pas**

**Vérifications :**
- ✅ Vérifiez que le serveur de développement est démarré : `ng serve`
- ✅ Ouvrez la console du navigateur (F12) pour voir les erreurs
- ✅ Vérifiez que vous êtes sur `http://localhost:4200`

**Solution :**
```bash
ng serve
```

### 2. **Le modal ne s'ouvre pas quand vous cliquez sur le bouton**

**Vérifications :**
- ✅ Ouvrez la console du navigateur (F12)
- ✅ Cherchez les messages de log : `🧮 Interface calculateur de fenêtres ouverte`
- ✅ Vérifiez s'il y a des erreurs JavaScript

**Solution :**
Si vous voyez des erreurs dans la console, redémarrez le serveur :
```bash
# Arrêtez le serveur (Ctrl+C)
ng serve
```

### 3. **La sélection de mur ne fonctionne pas**

**Vérifications :**
- ✅ Ouvrez la console du navigateur (F12)
- ✅ Sélectionnez un mur dans la liste déroulante
- ✅ Cherchez les messages : `🔍 Mur sélectionné:` et `📐 Informations du mur:`

**Messages attendus :**
```
🔍 Mur sélectionné: principal
📐 Informations du mur: {position: {x: 0, y: 0, z: 2.3}, dimensions: {width: 8, height: 2.5, depth: 0.2}, color: 11184810}
```

### 4. **Les calculs ne s'affichent pas**

**Vérifications :**
- ✅ Vérifiez que vous avez sélectionné un mur
- ✅ Ajustez les paramètres des fenêtres
- ✅ Cherchez les messages : `🧮 Calcul de capacité pour le mur:` et `📊 Résultat du calcul:`

**Messages attendus :**
```
🧮 Calcul de capacité pour le mur: {position: {x: 0, y: 0, z: 2.3}, dimensions: {width: 8, height: 2.5, depth: 0.2}, color: 11184810}
📏 Paramètres fenêtres: {largeurFenetre: 1.5, hauteurFenetre: 1.2, ecart: 0.5, nombreFenetres: 2, couleur: "#ff0000"}
📊 Résultat du calcul: {nombreMaxFenetres: 4, largeurFenetreOptimale: 1.5, ecartOptimal: 0.5, positionsCalculees: Array(4), largeurTotaleUtilisee: 6.5, margeRestante: 1.5, isValid: true, message: "✅ 4 fenêtre(s) possible(s) avec 1.50m de marge"}
```

### 5. **Les fenêtres ne s'appliquent pas au modèle 3D**

**Vérifications :**
- ✅ Vérifiez que vous avez généré une configuration
- ✅ Cliquez sur "🚀 Générer Configuration" avant "🎯 Appliquer au Modèle"
- ✅ Vérifiez les messages dans la console

**Messages attendus :**
```
✅ Configuration générée: openings: {
  window1: {
    position: { x: -2.50, y: 1.25, z: 2.30 },
    dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
    color: 0xff0000,
    type: 'window' as const
  },
  ...
}
✅ 2 fenêtre(s) ajoutée(s) au mur principal !
```

## 🔍 Diagnostic Étape par Étape

### **Étape 1 : Vérifier l'Interface**
1. Ouvrez `http://localhost:4200`
2. Cherchez le bouton **"🧮 Calculateur Fenêtres"** dans le panneau de contrôle
3. Cliquez dessus

### **Étape 2 : Vérifier la Console**
1. Ouvrez la console du navigateur (F12)
2. Cliquez sur le bouton du calculateur
3. Vous devriez voir : `🧮 Interface calculateur de fenêtres ouverte`

### **Étape 3 : Tester la Sélection de Mur**
1. Dans le modal qui s'ouvre, sélectionnez "Mur Principal (Façade)"
2. Vérifiez la console pour les messages de debug
3. Vous devriez voir les informations du mur

### **Étape 4 : Tester les Calculs**
1. Ajustez les sliders (largeur, hauteur, écart)
2. Vérifiez que les résultats s'affichent
3. Vous devriez voir le nombre max de fenêtres

### **Étape 5 : Tester l'Application**
1. Cliquez sur "🚀 Générer Configuration"
2. Cliquez sur "🎯 Appliquer au Modèle"
3. Vérifiez que les fenêtres apparaissent dans le modèle 3D

## 🛠️ Solutions Techniques

### **Problème : Erreurs TypeScript**
```bash
ng build
```
Si des erreurs apparaissent, corrigez-les avant de continuer.

### **Problème : Service non injecté**
Vérifiez que `CalculateurFenetresService` est bien dans `app.config.ts` :
```typescript
providers: [
  // ... autres services
  CalculateurFenetresService
]
```

### **Problème : Interface non chargée**
Vérifiez que le modal est bien dans le template HTML et que les styles CSS sont présents.

### **Problème : Calculs incorrects**
Vérifiez les dimensions des murs dans `building-config.ts` et la méthode `getMurFromConfig`.

## 📞 Support

Si le problème persiste :

1. **Copiez les messages d'erreur** de la console
2. **Décrivez exactement** ce qui ne fonctionne pas
3. **Indiquez** sur quel navigateur vous testez
4. **Vérifiez** que tous les fichiers ont été sauvegardés

## 🎯 Test Rapide

Pour tester rapidement si tout fonctionne :

1. Ouvrez `http://localhost:4200`
2. Cliquez sur "🧮 Calculateur Fenêtres"
3. Sélectionnez "Mur Principal (Façade)"
4. Vous devriez voir : "✅ 4 fenêtre(s) possible(s) avec 1.50m de marge"

Si vous voyez ce message, le calculateur fonctionne ! 🎉

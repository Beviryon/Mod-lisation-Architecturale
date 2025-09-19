# 🏗️ Modélisation Architecturale 3D

Un projet de visualisation 3D d'un bâtiment architectural développé avec **Angular** et **Three.js**.

## 📚 Documentation

**👉 [Consultez la documentation complète](./Documentations/README.md)**

**👉 [Index rapide](./INDEX.md)**

## 🚀 Démarrage Rapide

### 📋 Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### 🔧 Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

### 🌐 Accès
Ouvrez votre navigateur sur : `http://localhost:4200`

## 🎯 Fonctionnalités Principales

### 🏗️ Modélisation 3D
- **Rendu Three.js** : Scène 3D interactive
- **Navigation** : Rotation, zoom, déplacement
- **Éclairage** : Sources multiples avec ombres

### 🧱 Gestion des Murs
- **4 murs** : Principal, Arrière, Gauche, Droit
- **Modifications** : Position, dimensions, épaisseur, couleur
- **Calculs** : Surfaces, volumes, statistiques

### 🚪 Gestion des Ouvertures
- **Portes et fenêtres** : Types et propriétés
- **Couleurs** : Changement en temps réel
- **Statistiques** : Répartition et pourcentages

### 🎨 Système de Matériaux
- **Palettes** : Moderne, Classique, Naturelle, Architecturale
- **Couleurs** : Conversion Hex/RGB/HSL
- **Textures** : Support des textures 3D

## 🎛️ Interface Utilisateur

### 🎮 Contrôles Principaux
- **Voir la légende** : Informations sur les éléments
- **Test des Services** : Accès à tous les tests
- **Synchroniser** : Alignement des données

### 🧪 Panel de Test
- **Sidebar latérale** : Tests organisés par catégories
- **Tests automatisés** : Résultats détaillés
- **Modifications interactives** : Changements en temps réel

### 🎨 Sélecteur de Couleurs
- **Interface intuitive** : Sélection facile
- **Aperçu temps réel** : Changements immédiats
- **Réinitialisation** : Retour aux couleurs originales

## 🔧 Services Disponibles

| Service | Rôle | Fonctionnalités |
|---------|------|-----------------|
| **ConfigurationService** | 🏢 Cœur du système | Gestion de la configuration globale |
| **MurService** | 🧱 Gestion des murs | Calculs, modifications, statistiques |
| **BatimentService** | 📊 Statistiques globales | Métriques du bâtiment |
| **OuvertureService** | 🚪 Gestion des ouvertures | Portes et fenêtres |
| **MateriauService** | 🎨 Matériaux et couleurs | Palettes, textures, couleurs |
| **SceneService** | 🎬 Configuration 3D | Caméra, éclairage, contrôles |
| **CommunicationService** | 📡 Communication | Événements entre services |
| **ValidationService** | ✅ Validation | Règles architecturales |

## 📁 Structure du Projet

```
prject-3D/
├── 📚 Documentations/          # Documentation complète
├── 🏗️ src/app/               # Code source Angular
│   ├── components/            # Composants (Scene3D)
│   ├── services/             # Services métier
│   └── config/               # Configuration
├── 🧪 test-services.ts        # Tests programmatiques
├── 🔄 synchroniser-donnees.ts  # Script de synchronisation
└── 📖 README.md              # Documentation principale
```

## 🎯 Utilisation

### 🚀 Première Utilisation
1. **Lancez l'application** : `npm start`
2. **Synchronisez les données** : Cliquez sur "🔄 Synchroniser"
3. **Testez les services** : Cliquez sur "🧪 Test des Services"
4. **Explorez les fonctionnalités** : Utilisez la sidebar de test

### 🧪 Tests Disponibles
- **Statistiques** : Données globales du bâtiment
- **Couleurs** : Changement de couleurs interactif
- **Matériaux** : Test des matériaux et palettes
- **Scène 3D** : Configuration de la scène
- **Murs** : Test et modification des murs
- **Export** : Sauvegarde de configuration

## 🛠️ Technologies Utilisées

### 🎨 Frontend
- **Angular 20** : Framework principal
- **Three.js** : Bibliothèque 3D
- **TypeScript** : Langage de développement
- **RxJS** : Programmation réactive

### 🏗️ Architecture
- **Services Angular** : Architecture modulaire
- **Dependency Injection** : Injection de dépendances
- **Observables** : Communication réactive
- **Interfaces TypeScript** : Typage fort

### 🎯 Fonctionnalités 3D
- **WebGL** : Rendu 3D accéléré
- **Caméra perspective** : Vue réaliste
- **Éclairage** : Sources multiples
- **Ombres** : Rendu des ombres

## 🔧 Développement

### 🧪 Tests
```bash
# Tests unitaires
npm test

# Tests des services
node test-services.ts

# Synchronisation des données
node synchroniser-donnees.ts
```

### 📊 Validation
- **Linting** : ESLint et Prettier
- **Types** : TypeScript strict
- **Tests** : Jasmine/Karma
- **Validation** : Règles architecturales

## 📞 Support

### 🚀 Démarrage
1. Consultez la [Documentation Complète](./Documentations/README.md)
2. Suivez le [Guide de Synchronisation](./Documentations/GUIDE-SYNCHRONISATION.md)
3. Testez avec les [Guides de Test](./Documentations/)

### 🔧 Dépannage
- **Console du navigateur** : Messages d'erreur
- **Tests manuels** : [Guide de Test Manuel](./Documentations/exemple-test-manuel.md)
- **Validation** : Vérification des données

### 📚 Ressources
- **Documentation complète** : `Documentations/README.md`
- **Tests programmatiques** : `test-services.ts`
- **Script de synchronisation** : `synchroniser-donnees.ts`

## 🎨 Personnalisation

### 🎨 Couleurs
- Modifiez les couleurs via le sélecteur interactif
- Utilisez les palettes prédéfinies
- Créez vos propres couleurs

### 🧱 Murs
- Modifiez les dimensions via l'interface
- Changez les positions en temps réel
- Ajustez l'épaisseur des murs

### 🚪 Ouvertures
- Ajoutez ou modifiez les ouvertures
- Changez les couleurs des portes et fenêtres
- Ajustez les dimensions

## 📈 Statistiques

Le projet fournit des statistiques détaillées :
- **Surfaces** : Calculs automatiques
- **Volumes** : Métriques précises
- **Pourcentages** : Répartition des éléments
- **Validation** : Règles architecturales

## 🚀 Prochaines Étapes

- [ ] Ajout de nouvelles textures
- [ ] Support de l'export 3D
- [ ] Intégration de nouvelles palettes
- [ ] Amélioration des contrôles
- [ ] Tests automatisés étendus

---

*Projet développé avec ❤️ en Angular et Three.js*

*Documentation mise à jour le : {{ new Date().toLocaleDateString('fr-FR') }}*
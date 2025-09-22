# 🧪 Exemple de test manuel des services

## Test du ConfigurationService

```javascript
// Dans la console du navigateur
const configService = sceneComponent.configurationService;

// 1. Récupérer la configuration actuelle
const config = configService.getConfiguration();
console.log('Configuration actuelle:', config);

// 2. Modifier le nom du bâtiment
const nouvelleConfig = { ...config, nom: 'Mon Bâtiment Test' };
configService.mettreAJourConfiguration(nouvelleConfig);

// 3. Vérifier la modification
const configModifiee = configService.getConfiguration();
console.log('Nom modifié:', configModifiee.nom);

// 4. Obtenir les dimensions
const dimensions = configService.getDimensionsBatiment();
console.log('Dimensions:', dimensions);
```

## Test du BatimentService

```javascript
const batimentService = sceneComponent.batimentService;

// 1. Obtenir les propriétés
const proprietes = batimentService.getProprietes();
console.log('Propriétés:', proprietes);

// 2. Calculer les statistiques
const stats = batimentService.getStatistiques();
console.log('Statistiques:', stats);

// 3. Changer le type de bâtiment
batimentService.changerTypeBatiment('commercial');
console.log('Nouveau type:', batimentService.getTypeBatiment());

// 4. Exporter les données
const exportData = batimentService.exporterDonnees();
console.log('Données exportées:', JSON.parse(exportData));
```

## Test du MurService

```javascript
const murService = sceneComponent.murService;

// 1. Obtenir tous les murs
const murs = murService.getMurs();
console.log('Murs:', murs);

// 2. Obtenir le mur principal
const murPrincipal = murService.getMurPrincipal();
console.log('Mur principal:', murPrincipal);

// 3. Modifier la couleur
murService.modifierCouleurMur('principal', 0xff0000); // Rouge
console.log('Couleur modifiée');

// 4. Obtenir les statistiques
const statsMurs = murService.getStatistiquesMurs();
console.log('Statistiques murs:', statsMurs);
```

## Test du OuvertureService

```javascript
const ouvertureService = sceneComponent.ouvertureService;

// 1. Obtenir toutes les ouvertures
const ouvertures = ouvertureService.getOuvertures();
console.log('Ouvertures:', ouvertures);

// 2. Séparer portes et fenêtres
const portes = ouvertureService.getPortes();
const fenetres = ouvertureService.getFenetres();
console.log('Portes:', portes);
console.log('Fenêtres:', fenetres);

// 3. Obtenir les statistiques
const statsOuvertures = ouvertureService.getStatistiquesOuvertures();
console.log('Statistiques ouvertures:', statsOuvertures);
```

## Test du MateriauService

```javascript
const materiauService = sceneComponent.materiauService;

// 1. Obtenir tous les matériaux
const materiaux = materiauService.getMateriaux();
console.log('Matériaux:', materiaux);

// 2. Obtenir les palettes
const palettes = materiauService.getPalettes();
console.log('Palettes:', palettes);

// 3. Générer une couleur aléatoire
const couleurAleatoire = materiauService.genererCouleurAleatoire();
console.log('Couleur aléatoire:', `#${couleurAleatoire.toString(16)}`);

// 4. Générer une palette harmonieuse
const palette = materiauService.genererPaletteHarmonieuse(0xff0000, 5);
console.log('Palette harmonieuse:', palette);
```

## Test du SceneService

```javascript
const sceneService = sceneComponent.sceneService;

// 1. Obtenir les propriétés de la scène
const proprietesScene = sceneService.getProprietesScene();
console.log('Propriétés scène:', proprietesScene);

// 2. Obtenir les propriétés de la caméra
const proprietesCamera = sceneService.getProprietesCamera();
console.log('Propriétés caméra:', proprietesCamera);

// 3. Obtenir les lumières
const lumieres = sceneService.getLumieres();
console.log('Lumières:', lumieres);

// 4. Obtenir les statistiques
const statsScene = sceneService.getStatistiquesScene();
console.log('Statistiques scène:', statsScene);
```

## Test de communication entre services

```javascript
// Test de la réactivité entre services
const configService = sceneComponent.configurationService;
const batimentService = sceneComponent.batimentService;

// 1. Écouter les changements de configuration
configService.getConfigurationObservable().subscribe(config => {
  console.log('Configuration changée:', config.nom);
});

// 2. Écouter les changements de propriétés du bâtiment
batimentService.getProprietesObservable().subscribe(proprietes => {
  console.log('Propriétés changées:', proprietes.nom);
});

// 3. Modifier la configuration (devrait déclencher les observables)
const config = configService.getConfiguration();
configService.mettreAJourConfiguration({
  ...config,
  nom: 'Bâtiment Modifié'
});
```

## Test d'erreur et validation

```javascript
// Test de validation des données
const configService = sceneComponent.configurationService;

try {
  // Tentative de configuration invalide
  configService.mettreAJourConfiguration({
    nom: '', // Nom vide
    dimensions: { longueur: -1, largeur: 0, hauteur: 0 } // Dimensions invalides
  });
} catch (error) {
  console.log('Erreur capturée:', error.message);
}

// Test de validation des matériaux
const materiauService = sceneComponent.materiauService;

try {
  materiauService.ajouterMateriau({
    nom: '', // Nom vide
    type: 'mur',
    couleur: -1, // Couleur invalide
    couleurHex: '#invalid',
    couleurRgb: { r: 0, g: 0, b: 0 },
    couleurHsl: { h: 0, s: 0, l: 0 },
    rugosite: 0.5,
    metallic: 0,
    transparent: false,
    opacity: 1,
    emissive: 0x000000,
    emissiveIntensity: 0
  });
} catch (error) {
  console.log('Erreur validation matériau:', error.message);
}
```

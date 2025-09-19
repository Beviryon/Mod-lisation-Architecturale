/**
 * Script de synchronisation des données entre building-config.ts et ConfigurationService
 * Ce script permet de synchroniser les données pour que les statistiques correspondent à la réalité
 */

import { BUILDING_CONFIG } from './src/app/config/building-config';
import { ConfigurationService, ConfigurationBatiment } from './src/app/services/configuration/configuration.service';

/**
 * Convertit les données de building-config.ts vers le format ConfigurationService
 */
function convertirBuildingConfigVersConfigurationService(): ConfigurationBatiment {
  const config = BUILDING_CONFIG;
  
  return {
    nom: 'Bâtiment Principal',
    description: 'Bâtiment architectural avec murs, ouvertures et toit',
    dimensions: {
      longueur: config.ground.dimensions.width,  // 8m
      largeur: config.ground.dimensions.depth,   // 5m
      hauteur: config.mainWall.contour[2].y      // 2.5m
    },
    murs: {
      principal: {
        position: config.mainWall.position,
        dimensions: {
          width: Math.abs(config.mainWall.contour[1].x - config.mainWall.contour[0].x), // 8m
          height: config.mainWall.contour[2].y, // 2.5m
          depth: config.mainWall.thickness // 0.2m
        },
        couleur: config.mainWall.color,
        epaisseur: config.mainWall.thickness,
        ouvertures: [
          // Fenêtre bleue (window1 dans building-config)
          {
            id: 'fenetre1',
            type: 'fenetre',
            position: { x: -1.5, y: 1.5, z: 2.3 },
            dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
            couleur: 0x0000ff,
            nom: 'Fenêtre Bleue'
          },
          // Fenêtre rouge (window2 dans building-config)
          {
            id: 'fenetre2',
            type: 'fenetre',
            position: config.mainWall.openings.window2.position,
            dimensions: config.mainWall.openings.window2.dimensions,
            couleur: config.mainWall.openings.window2.color,
            nom: 'Fenêtre Rouge'
          }
        ]
      },
      arriere: {
        position: config.walls.back.position,
        dimensions: config.walls.back.dimensions,
        couleur: config.walls.back.color,
        epaisseur: config.walls.back.dimensions.depth,
        ouvertures: [
          // Fenêtre arrière
          {
            id: 'fenetre3',
            type: 'fenetre',
            position: config.walls.back.openings.window1.position,
            dimensions: config.walls.back.openings.window1.dimensions,
            couleur: config.walls.back.openings.window1.color,
            nom: 'Fenêtre Arrière'
          }
        ]
      },
      gauche: {
        position: config.walls.left.position,
        dimensions: config.walls.left.dimensions,
        couleur: config.walls.left.color,
        epaisseur: config.walls.left.dimensions.width,
        ouvertures: []
      },
      droit: {
        position: config.walls.right.position,
        dimensions: config.walls.right.dimensions,
        couleur: config.walls.right.color,
        epaisseur: config.walls.right.dimensions.width,
        ouvertures: [
          // Porte d'entrée
          {
            id: 'porte1',
            type: 'porte',
            position: config.walls.right.openings.door.position,
            dimensions: config.walls.right.openings.door.dimensions,
            couleur: config.walls.right.openings.door.color,
            nom: 'Porte d\'Entrée'
          }
        ]
      }
    },
    toit: {
      position: config.roof.position,
      dimensions: config.roof.dimensions,
      couleur: config.roof.color
    },
    sol: {
      position: config.ground.position,
      dimensions: config.ground.dimensions,
      couleur: config.ground.color
    }
  };
}

/**
 * Fonction pour synchroniser les données dans la console du navigateur
 */
function synchroniserDonnees(): void {
  console.log('🔄 Synchronisation des données...');
  
  // Récupérer le composant Scene3d depuis la fenêtre
  const sceneComponent = (window as any).sceneComponent;
  
  if (!sceneComponent || !sceneComponent.configurationService) {
    console.error('❌ ConfigurationService non trouvé. Assurez-vous que l\'application est chargée.');
    return;
  }
  
  const configService = sceneComponent.configurationService;
  
  try {
    // Convertir les données de building-config vers ConfigurationService
    const nouvelleConfiguration = convertirBuildingConfigVersConfigurationService();
    
    // Mettre à jour le ConfigurationService
    configService.mettreAJourConfiguration(nouvelleConfiguration);
    
    console.log('✅ Données synchronisées avec succès!');
    console.log('📊 Nouvelles données:', nouvelleConfiguration);
    
    // Afficher les statistiques mises à jour
    const batimentService = sceneComponent.batimentService;
    if (batimentService) {
      const stats = batimentService.getStatistiques();
      console.log('📈 Statistiques mises à jour:', stats);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
}

/**
 * Fonction pour afficher les différences entre les deux sources
 */
function comparerDonnees(): void {
  console.log('🔍 Comparaison des données...');
  
  const sceneComponent = (window as any).sceneComponent;
  if (!sceneComponent || !sceneComponent.configurationService) {
    console.error('❌ ConfigurationService non trouvé.');
    return;
  }
  
  const configService = sceneComponent.configurationService;
  const configActuelle = configService.getConfiguration();
  const configBuilding = convertirBuildingConfigVersConfigurationService();
  
  console.log('📋 Configuration actuelle (ConfigurationService):', configActuelle);
  console.log('📋 Configuration building-config.ts:', configBuilding);
  
  // Comparer les dimensions
  console.log('\n📐 Comparaison des dimensions:');
  console.log('ConfigurationService:', configActuelle.dimensions);
  console.log('building-config.ts:', configBuilding.dimensions);
  
  // Comparer le nombre d'ouvertures
  const ouverturesActuelles = configActuelle.murs.principal.ouvertures.length + 
                             configActuelle.murs.arriere.ouvertures.length + 
                             configActuelle.murs.droit.ouvertures.length;
  
  const ouverturesBuilding = configBuilding.murs.principal.ouvertures.length + 
                            configBuilding.murs.arriere.ouvertures.length + 
                            configBuilding.murs.droit.ouvertures.length;
  
  console.log('\n🚪 Comparaison des ouvertures:');
  console.log('ConfigurationService:', ouverturesActuelles, 'ouvertures');
  console.log('building-config.ts:', ouverturesBuilding, 'ouvertures');
}

/**
 * Fonction pour calculer les vraies statistiques basées sur building-config.ts
 */
function calculerVraiesStatistiques(): void {
  console.log('🧮 Calcul des vraies statistiques...');
  
  const config = BUILDING_CONFIG;
  
  // Calculer la surface des murs
  const surfaceMurPrincipal = 8 * 2.5; // 8m x 2.5m
  const surfaceMurArriere = 8 * 2.5;   // 8m x 2.5m
  const surfaceMurGauche = 5 * 2.5;    // 5m x 2.5m
  const surfaceMurDroit = 5 * 2.5;     // 5m x 2.5m
  
  const surfaceTotaleMurs = surfaceMurPrincipal + surfaceMurArriere + surfaceMurGauche + surfaceMurDroit;
  
  // Calculer la surface des ouvertures
  const surfaceFenetre1 = 1.5 * 1.2;   // Fenêtre bleue
  const surfaceFenetre2 = 2 * 1.2;     // Fenêtre rouge (principale)
  const surfaceFenetre3 = 1.5 * 1.2;   // Fenêtre arrière
  const surfacePorte = 1 * 2.1;        // Porte d'entrée
  
  const surfaceTotaleOuvertures = surfaceFenetre1 + surfaceFenetre2 + surfaceFenetre3 + surfacePorte;
  
  const pourcentageOuvertures = (surfaceTotaleOuvertures / surfaceTotaleMurs) * 100;
  
  const vraiesStatistiques = {
    nombreMurs: 4,
    nombreOuvertures: 4,
    nombrePortes: 1,
    nombreFenetres: 3,
    surfaceMurs: Math.round(surfaceTotaleMurs * 100) / 100,
    surfaceOuvertures: Math.round(surfaceTotaleOuvertures * 100) / 100,
    pourcentageOuvertures: Math.round(pourcentageOuvertures * 100) / 100,
    details: {
      surfaceMurPrincipal,
      surfaceMurArriere,
      surfaceMurGauche,
      surfaceMurDroit,
      surfaceFenetre1,
      surfaceFenetre2,
      surfaceFenetre3,
      surfacePorte
    }
  };
  
  console.log('📊 Vraies statistiques (basées sur building-config.ts):', vraiesStatistiques);
  
  return vraiesStatistiques;
}

// Exporter les fonctions pour utilisation globale
(window as any).synchroniserDonnees = synchroniserDonnees;
(window as any).comparerDonnees = comparerDonnees;
(window as any).calculerVraiesStatistiques = calculerVraiesStatistiques;

console.log('🔄 Script de synchronisation chargé!');
console.log('📋 Commandes disponibles:');
console.log('  - synchroniserDonnees() : Synchronise les données');
console.log('  - comparerDonnees() : Compare les deux sources');
console.log('  - calculerVraiesStatistiques() : Calcule les vraies statistiques');

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigDirectService, ConfigurationComplete } from '../../config/config-direct';

/**
 * Interface pour la configuration d'un bâtiment
 */
export interface ConfigurationBatiment {
  // Configuration générale
  nom: string;
  description: string;
  dimensions: {
    longueur: number;  // en mètres
    largeur: number;   // en mètres
    hauteur: number;   // en mètres
  };
  
  // Configuration des murs
  murs: {
    principal: ConfigurationMur;
    arriere: ConfigurationMur;
    gauche: ConfigurationMur;
    droit: ConfigurationMur;
  };
  
  // Configuration du toit
  toit: ConfigurationToit;
  
  // Configuration du sol
  sol: ConfigurationSol;
}

/**
 * Interface pour la configuration d'un mur
 */
export interface ConfigurationMur {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
  epaisseur: number;
  ouvertures: ConfigurationOuverture[];
}

/**
 * Interface pour la configuration d'une ouverture
 */
export interface ConfigurationOuverture {
  id: string;
  type: 'porte' | 'fenetre';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
  nom?: string;
}

/**
 * Interface pour la configuration du toit
 */
export interface ConfigurationToit {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
}

/**
 * Interface pour la configuration du sol
 */
export interface ConfigurationSol {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
}

/**
 * Service de gestion de la configuration du bâtiment
 * Remplace le fichier building-config.ts statique
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  
  // Configuration par défaut
  private configurationParDefaut: ConfigurationBatiment = {
    nom: 'Bâtiment Principal',
    description: 'Bâtiment architectural avec murs, ouvertures et toit',
    dimensions: {
      longueur: 8,
      largeur: 5,
      hauteur: 2.5
    },
    murs: {
      principal: {
        position: { x: 0, y: 0, z: 2.3 },
        dimensions: { width: 8, height: 2.5, depth: 0.2 },
        couleur: 0xaaaaaa,
        epaisseur: 0.2,
        ouvertures: [
          {
            id: 'fenetre1',
            type: 'fenetre',
            position: { x: -1.5, y: 1.5, z: 2.3 },
            dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
            couleur: 0x0000ff,
            nom: 'Fenêtre Bleue'
          },
          {
            id: 'fenetre2',
            type: 'fenetre',
            position: { x: 0, y: 1.5, z: 2.3 },
            dimensions: { width: 2, height: 1.2, depth: 0.05 },
            couleur: 0xff0000,
            nom: 'Fenêtre Rouge'
          }
        ]
      },
      arriere: {
        position: { x: 0, y: 0, z: -2.5 },
        dimensions: { width: 8, height: 2.5, depth: 0.2 },
        couleur: 0xaaaaaa,
        epaisseur: 0.2,
        ouvertures: [
          {
            id: 'fenetre3',
            type: 'fenetre',
            position: { x: 0, y: 1.5, z: -2.3 },
            dimensions: { width: 1.5, height: 1.2, depth: 0.05 },
            couleur: 0xff0000,
            nom: 'Fenêtre Arrière'
          }
        ]
      },
      gauche: {
        position: { x: -3.9, y: 1.25, z: 0 },
        dimensions: { width: 0.2, height: 2.5, depth: 5 },
        couleur: 0xaaaaaa,
        epaisseur: 0.2,
        ouvertures: []
      },
      droit: {
        position: { x: 3.8, y: 0, z: 0 },
        dimensions: { width: 0.2, height: 2.5, depth: 5 },
        couleur: 0xaaaaaa,
        epaisseur: 0.2,
        ouvertures: [
          {
            id: 'porte1',
            type: 'porte',
            position: { x: 3.9, y: 1.05, z: 0 },
            dimensions: { width: 1, height: 2.1, depth: 0.05 },
            couleur: 0x00ff00,
            nom: 'Porte d\'Entrée'
          }
        ]
      }
    },
    toit: {
      position: { x: 0, y: 2.6, z: 0 },
      dimensions: { width: 8.4, height: 0.2, depth: 5 },
      couleur: 0x4169e1
    },
    sol: {
      position: { x: 0, y: -0.1, z: 0 },
      dimensions: { width: 8.2, height: 0.2, depth: 5.2 },
      couleur: 0x8b4513
    }
  };

  // Subject pour la configuration actuelle
  private configurationActuelle = new BehaviorSubject<ConfigurationBatiment>(this.configurationParDefaut);
  
  // Observable public
  public configuration$ = this.configurationActuelle.asObservable();

  constructor(private configDirectService: ConfigDirectService) {
    console.log('ConfigurationService initialisé avec ConfigDirectService');
    
    // Écouter les changements du ConfigDirectService
    this.configDirectService.configuration$.subscribe(config => {
      this.synchroniserAvecConfigDirect(config);
    });
  }

  /**
   * Synchroniser avec la configuration directe
   */
  private synchroniserAvecConfigDirect(config: ConfigurationComplete): void {
    try {
      const nouvelleConfig: ConfigurationBatiment = {
        nom: 'Bâtiment Direct',
        description: 'Configuration chargée directement depuis building-config.ts',
        dimensions: {
          longueur: config.walls.back.dimensions.width,
          largeur: config.walls.left.dimensions.depth,
          hauteur: config.walls.back.dimensions.height
        },
        murs: {
          principal: {
            position: config.mainWall.position,
            dimensions: {
              width: config.mainWall.contour[1].x - config.mainWall.contour[0].x, // Calcul de la largeur
              height: config.mainWall.contour[2].y - config.mainWall.contour[0].y, // Calcul de la hauteur
              depth: config.mainWall.thickness
            },
            couleur: config.mainWall.color,
            epaisseur: config.mainWall.thickness,
            ouvertures: []
          },
          arriere: {
            position: config.walls.back.position,
            dimensions: config.walls.back.dimensions,
            couleur: config.walls.back.color,
            epaisseur: config.walls.back.dimensions.depth,
            ouvertures: config.walls.back.openings ? [
              {
                id: 'fenetre-arriere',
                position: config.walls.back.openings.window1.position,
                dimensions: config.walls.back.openings.window1.dimensions,
                couleur: config.walls.back.openings.window1.color,
                type: config.walls.back.openings.window1.type === 'window' ? 'fenetre' : 'porte',
                nom: 'Fenêtre Arrière'
              }
            ] : []
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
            ouvertures: config.walls.right.openings ? [
              {
                id: 'porte-principale',
                position: config.walls.right.openings.door.position,
                dimensions: config.walls.right.openings.door.dimensions,
                couleur: config.walls.right.openings.door.color,
                type: config.walls.right.openings.door.type === 'door' ? 'porte' : 'fenetre',
                nom: 'Porte Principale'
              }
            ] : []
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

      this.configurationActuelle.next(nouvelleConfig);
      console.log('🔄 Configuration synchronisée avec ConfigDirectService');
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }

  /**
   * Recharger la configuration depuis building-config.ts
   */
  public rechargerConfiguration(): void {
    this.configDirectService.rechargerConfiguration();
    console.log('🔄 Configuration rechargée depuis building-config.ts');
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfiguration(): ConfigurationBatiment {
    return this.configurationActuelle.value;
  }

  /**
   * Obtenir la configuration en tant qu'Observable
   */
  getConfigurationObservable(): Observable<ConfigurationBatiment> {
    return this.configuration$;
  }

  /**
   * Mettre à jour la configuration complète
   */
  mettreAJourConfiguration(nouvelleConfiguration: ConfigurationBatiment): void {
    try {
      // Validation de la configuration
      if (!nouvelleConfiguration || !nouvelleConfiguration.nom || !nouvelleConfiguration.dimensions) {
        throw new Error('Configuration invalide: propriétés manquantes');
      }
      
      if (nouvelleConfiguration.dimensions.longueur <= 0 || 
          nouvelleConfiguration.dimensions.largeur <= 0 || 
          nouvelleConfiguration.dimensions.hauteur <= 0) {
        throw new Error('Configuration invalide: dimensions doivent être positives');
      }
      
      this.configurationActuelle.next(nouvelleConfiguration);
      console.log('Configuration mise à jour:', nouvelleConfiguration);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un mur spécifique
   */
  mettreAJourMur(nomMur: keyof ConfigurationBatiment['murs'], nouveauMur: ConfigurationMur): void {
    const configActuelle = this.getConfiguration();
    configActuelle.murs[nomMur] = nouveauMur;
    this.mettreAJourConfiguration(configActuelle);
  }

  /**
   * Ajouter une ouverture à un mur
   */
  ajouterOuverture(nomMur: keyof ConfigurationBatiment['murs'], nouvelleOuverture: ConfigurationOuverture): void {
    const configActuelle = this.getConfiguration();
    configActuelle.murs[nomMur].ouvertures.push(nouvelleOuverture);
    this.mettreAJourConfiguration(configActuelle);
  }

  /**
   * Supprimer une ouverture d'un mur
   */
  supprimerOuverture(nomMur: keyof ConfigurationBatiment['murs'], idOuverture: string): void {
    const configActuelle = this.getConfiguration();
    const mur = configActuelle.murs[nomMur];
    mur.ouvertures = mur.ouvertures.filter(ouverture => ouverture.id !== idOuverture);
    this.mettreAJourConfiguration(configActuelle);
  }

  /**
   * Réinitialiser à la configuration par défaut
   */
  reinitialiserConfiguration(): void {
    this.configurationActuelle.next(this.configurationParDefaut);
    console.log('Configuration réinitialisée');
  }

  /**
   * Obtenir les dimensions du bâtiment
   */
  getDimensionsBatiment(): { longueur: number; largeur: number; hauteur: number } {
    return this.getConfiguration().dimensions;
  }

  /**
   * Obtenir tous les murs
   */
  getMurs(): ConfigurationBatiment['murs'] {
    return this.getConfiguration().murs;
  }

  /**
   * Obtenir un mur spécifique
   */
  getMur(nomMur: keyof ConfigurationBatiment['murs']): ConfigurationMur {
    return this.getConfiguration().murs[nomMur];
  }

  /**
   * Obtenir toutes les ouvertures de tous les murs
   */
  getAllOuvertures(): ConfigurationOuverture[] {
    const config = this.getConfiguration();
    const toutesOuvertures: ConfigurationOuverture[] = [];
    
    Object.values(config.murs).forEach(mur => {
      toutesOuvertures.push(...mur.ouvertures);
    });
    
    return toutesOuvertures;
  }
}


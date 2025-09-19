import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigurationService, ConfigurationMur } from '../configuration/configuration.service';

/**
 * Interface pour les propriétés d'un mur
 */
export interface ProprietesMur {
  id: string;
  nom: string;
  type: 'principal' | 'arriere' | 'gauche' | 'droit';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
  epaisseur: number;
  surface: number;
  volume: number;
  nombreOuvertures: number;
  pourcentageOuvertures: number;
  dateCreation: Date;
  derniereModification: Date;
}

/**
 * Interface pour les calculs géométriques d'un mur
 */
export interface CalculsMur {
  surfaceTotale: number;
  surfaceOuvertures: number;
  surfaceNet: number;
  volume: number;
  perimetre: number;
  centreGravite: { x: number; y: number; z: number };
}

/**
 * Interface pour la validation d'un mur
 */
export interface ValidationMur {
  isValid: boolean;
  erreurs: string[];
  avertissements: string[];
}

/**
 * Service de gestion des murs
 */
@Injectable({
  providedIn: 'root'
})
export class MurService {
  
  private mursActuels = new BehaviorSubject<ProprietesMur[]>([]);
  public murs$ = this.mursActuels.asObservable();

  constructor(private configurationService: ConfigurationService) {
    // Initialiser avec la configuration actuelle
    this.initialiserMurs();
    
    // Écouter les changements de configuration
    this.configurationService.getConfigurationObservable().subscribe(() => {
      this.initialiserMurs();
    });
  }

  /**
   * Initialiser les murs à partir de la configuration
   */
  private initialiserMurs(): void {
    const config = this.configurationService.getConfiguration();
    const murs: ProprietesMur[] = [];
    
    Object.entries(config.murs).forEach(([type, murConfig]) => {
      const calculs = this.calculerProprietesMur(murConfig);
      const mur: ProprietesMur = {
        id: `mur_${type}`,
        nom: this.getNomMur(type),
        type: type as ProprietesMur['type'],
        position: murConfig.position,
        dimensions: murConfig.dimensions,
        couleur: murConfig.couleur,
        epaisseur: murConfig.epaisseur,
        surface: calculs.surfaceTotale,
        volume: calculs.volume,
        nombreOuvertures: murConfig.ouvertures.length,
        pourcentageOuvertures: calculs.surfaceOuvertures > 0 ? 
          Math.round((calculs.surfaceOuvertures / calculs.surfaceTotale) * 100 * 100) / 100 : 0,
        dateCreation: new Date(),
        derniereModification: new Date()
      };
      murs.push(mur);
    });
    
    this.mursActuels.next(murs);
  }

  /**
   * Obtenir le nom d'un mur selon son type
   */
  private getNomMur(type: string): string {
    const noms: Record<string, string> = {
      principal: 'Mur Principal',
      arriere: 'Mur Arrière',
      gauche: 'Mur Gauche',
      droit: 'Mur Droit'
    };
    return noms[type] || 'Mur Inconnu';
  }

  /**
   * Calculer les propriétés géométriques d'un mur
   */
  private calculerProprietesMur(murConfig: ConfigurationMur): CalculsMur {
    const surfaceTotale = murConfig.dimensions.width * murConfig.dimensions.height;
    const surfaceOuvertures = murConfig.ouvertures.reduce((total, ouverture) => {
      return total + (ouverture.dimensions.width * ouverture.dimensions.height);
    }, 0);
    const surfaceNet = surfaceTotale - surfaceOuvertures;
    const volume = surfaceTotale * murConfig.dimensions.depth;
    const perimetre = 2 * (murConfig.dimensions.width + murConfig.dimensions.height);
    
    const centreGravite = {
      x: murConfig.position.x,
      y: murConfig.position.y + (murConfig.dimensions.height / 2),
      z: murConfig.position.z
    };

    return {
      surfaceTotale: Math.round(surfaceTotale * 100) / 100,
      surfaceOuvertures: Math.round(surfaceOuvertures * 100) / 100,
      surfaceNet: Math.round(surfaceNet * 100) / 100,
      volume: Math.round(volume * 100) / 100,
      perimetre: Math.round(perimetre * 100) / 100,
      centreGravite
    };
  }

  /**
   * Obtenir tous les murs
   */
  getMurs(): ProprietesMur[] {
    return this.mursActuels.value;
  }

  /**
   * Obtenir les murs en tant qu'Observable
   */
  getMursObservable(): Observable<ProprietesMur[]> {
    return this.murs$;
  }

  /**
   * Obtenir un mur par son ID
   */
  getMurParId(id: string): ProprietesMur | undefined {
    return this.mursActuels.value.find(mur => mur.id === id);
  }

  /**
   * Obtenir un mur par son type
   */
  getMurParType(type: ProprietesMur['type']): ProprietesMur | undefined {
    return this.mursActuels.value.find(mur => mur.type === type);
  }

  /**
   * Obtenir le mur principal
   */
  getMurPrincipal(): ProprietesMur | undefined {
    return this.getMurParType('principal');
  }

  /**
   * Obtenir le mur arrière
   */
  getMurArriere(): ProprietesMur | undefined {
    return this.getMurParType('arriere');
  }

  /**
   * Obtenir le mur gauche
   */
  getMurGauche(): ProprietesMur | undefined {
    return this.getMurParType('gauche');
  }

  /**
   * Obtenir le mur droit
   */
  getMurDroit(): ProprietesMur | undefined {
    return this.getMurParType('droit');
  }

  /**
   * Modifier la position d'un mur
   */
  modifierPositionMur(type: ProprietesMur['type'], nouvellePosition: { x: number; y: number; z: number }): void {
    try {
      // Validation des paramètres
      if (!type || !nouvellePosition) {
        throw new Error('Paramètres manquants pour la modification de position');
      }
      
      if (typeof nouvellePosition.x !== 'number' || 
          typeof nouvellePosition.y !== 'number' || 
          typeof nouvellePosition.z !== 'number') {
        throw new Error('Position invalide: coordonnées doivent être des nombres');
      }
      
      const config = this.configurationService.getConfiguration();
      const murConfig = config.murs[type];
      
      if (!murConfig) {
        throw new Error(`Mur de type '${type}' non trouvé`);
      }
      
      murConfig.position = nouvellePosition;
      this.configurationService.mettreAJourMur(type, murConfig);
    } catch (error) {
      console.error('Erreur lors de la modification de position du mur:', error);
      throw error;
    }
  }

  /**
   * Modifier les dimensions d'un mur
   */
  modifierDimensionsMur(type: ProprietesMur['type'], nouvellesDimensions: { width: number; height: number; depth: number }): void {
    const config = this.configurationService.getConfiguration();
    const murConfig = config.murs[type];
    
    if (murConfig) {
      murConfig.dimensions = nouvellesDimensions;
      this.configurationService.mettreAJourMur(type, murConfig);
    }
  }

  /**
   * Modifier la couleur d'un mur
   */
  modifierCouleurMur(type: ProprietesMur['type'], nouvelleCouleur: number): void {
    const config = this.configurationService.getConfiguration();
    const murConfig = config.murs[type];
    
    if (murConfig) {
      murConfig.couleur = nouvelleCouleur;
      this.configurationService.mettreAJourMur(type, murConfig);
    }
  }

  /**
   * Modifier l'épaisseur d'un mur
   */
  modifierEpaisseurMur(type: ProprietesMur['type'], nouvelleEpaisseur: number): void {
    const config = this.configurationService.getConfiguration();
    const murConfig = config.murs[type];
    
    if (murConfig) {
      murConfig.epaisseur = nouvelleEpaisseur;
      murConfig.dimensions.depth = nouvelleEpaisseur;
      this.configurationService.mettreAJourMur(type, murConfig);
    }
  }

  /**
   * Valider un mur
   */
  validerMur(mur: ProprietesMur): ValidationMur {
    const erreurs: string[] = [];
    const avertissements: string[] = [];

    // Validation des dimensions
    if (mur.dimensions.width <= 0) {
      erreurs.push('La largeur du mur doit être positive');
    }
    if (mur.dimensions.height <= 0) {
      erreurs.push('La hauteur du mur doit être positive');
    }
    if (mur.dimensions.depth <= 0) {
      erreurs.push('L\'épaisseur du mur doit être positive');
    }

    // Validation de l'épaisseur
    if (mur.epaisseur < 0.1) {
      avertissements.push('L\'épaisseur du mur est très fine (< 10cm)');
    }
    if (mur.epaisseur > 1) {
      avertissements.push('L\'épaisseur du mur est très épaisse (> 1m)');
    }

    // Validation du pourcentage d'ouvertures
    if (mur.pourcentageOuvertures > 50) {
      avertissements.push('Le mur a plus de 50% d\'ouvertures');
    }

    // Validation de la position
    if (Math.abs(mur.position.x) > 10 || Math.abs(mur.position.y) > 10 || Math.abs(mur.position.z) > 10) {
      avertissements.push('La position du mur est très éloignée de l\'origine');
    }

    return {
      isValid: erreurs.length === 0,
      erreurs,
      avertissements
    };
  }

  /**
   * Obtenir les statistiques des murs
   */
  getStatistiquesMurs(): {
    nombreTotal: number;
    surfaceTotale: number;
    volumeTotal: number;
    nombreOuvertures: number;
    pourcentageOuverturesMoyen: number;
  } {
    const murs = this.getMurs();
    
    const nombreTotal = murs.length;
    const surfaceTotale = murs.reduce((total, mur) => total + mur.surface, 0);
    const volumeTotal = murs.reduce((total, mur) => total + mur.volume, 0);
    const nombreOuvertures = murs.reduce((total, mur) => total + mur.nombreOuvertures, 0);
    const pourcentageOuverturesMoyen = murs.length > 0 ? 
      murs.reduce((total, mur) => total + mur.pourcentageOuvertures, 0) / murs.length : 0;

    return {
      nombreTotal,
      surfaceTotale: Math.round(surfaceTotale * 100) / 100,
      volumeTotal: Math.round(volumeTotal * 100) / 100,
      nombreOuvertures,
      pourcentageOuverturesMoyen: Math.round(pourcentageOuverturesMoyen * 100) / 100
    };
  }

  /**
   * Obtenir les murs avec le plus d'ouvertures
   */
  getMursAvecPlusOuvertures(): ProprietesMur[] {
    const murs = this.getMurs();
    const maxOuvertures = Math.max(...murs.map(mur => mur.nombreOuvertures));
    return murs.filter(mur => mur.nombreOuvertures === maxOuvertures);
  }

  /**
   * Obtenir les murs sans ouvertures
   */
  getMursSansOuvertures(): ProprietesMur[] {
    return this.getMurs().filter(mur => mur.nombreOuvertures === 0);
  }

  /**
   * Calculer la distance entre deux murs
   */
  calculerDistanceEntreMurs(mur1: ProprietesMur, mur2: ProprietesMur): number {
    const dx = mur1.position.x - mur2.position.x;
    const dy = mur1.position.y - mur2.position.y;
    const dz = mur1.position.z - mur2.position.z;
    
    return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 100) / 100;
  }

  /**
   * Obtenir les murs adjacents
   */
  getMursAdjacents(mur: ProprietesMur): ProprietesMur[] {
    const murs = this.getMurs();
    const mursAdjacents: ProprietesMur[] = [];
    
    murs.forEach(autreMur => {
      if (autreMur.id !== mur.id) {
        const distance = this.calculerDistanceEntreMurs(mur, autreMur);
        // Considérer comme adjacent si la distance est inférieure à 5m
        if (distance < 5) {
          mursAdjacents.push(autreMur);
        }
      }
    });
    
    return mursAdjacents;
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigurationService, ConfigurationOuverture } from '../configuration/configuration.service';

/**
 * Interface pour les propriétés d'une ouverture
 */
export interface ProprietesOuverture {
  id: string;
  nom: string;
  type: 'porte' | 'fenetre';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: number;
  surface: number;
  volume: number;
  murParent: 'principal' | 'arriere' | 'gauche' | 'droit';
  dateCreation: Date;
  derniereModification: Date;
}

/**
 * Interface pour les calculs d'une ouverture
 */
export interface CalculsOuverture {
  surface: number;
  volume: number;
  perimetre: number;
  centreGravite: { x: number; y: number; z: number };
  ratioAspect: number; // largeur/hauteur
}

/**
 * Interface pour la validation d'une ouverture
 */
export interface ValidationOuverture {
  isValid: boolean;
  erreurs: string[];
  avertissements: string[];
}

/**
 * Interface pour les statistiques des ouvertures
 */
export interface StatistiquesOuvertures {
  nombreTotal: number;
  nombrePortes: number;
  nombreFenetres: number;
  surfaceTotale: number;
  surfacePortes: number;
  surfaceFenetres: number;
  pourcentagePortes: number;
  pourcentageFenetres: number;
}

/**
 * Service de gestion des ouvertures (portes et fenêtres)
 */
@Injectable({
  providedIn: 'root'
})
export class OuvertureService {
  
  private ouverturesActuelles = new BehaviorSubject<ProprietesOuverture[]>([]);
  public ouvertures$ = this.ouverturesActuelles.asObservable();

  constructor(private configurationService: ConfigurationService) {
    // Initialiser avec la configuration actuelle
    this.initialiserOuvertures();
    
    // Écouter les changements de configuration
    this.configurationService.getConfigurationObservable().subscribe(() => {
      this.initialiserOuvertures();
    });
  }

  /**
   * Initialiser les ouvertures à partir de la configuration
   */
  private initialiserOuvertures(): void {
    const config = this.configurationService.getConfiguration();
    const ouvertures: ProprietesOuverture[] = [];
    
    Object.entries(config.murs).forEach(([typeMur, murConfig]) => {
      murConfig.ouvertures.forEach(ouvertureConfig => {
        const calculs = this.calculerProprietesOuverture(ouvertureConfig);
        const ouverture: ProprietesOuverture = {
          id: ouvertureConfig.id,
          nom: ouvertureConfig.nom || `${ouvertureConfig.type}_${ouvertureConfig.id}`,
          type: ouvertureConfig.type,
          position: ouvertureConfig.position,
          dimensions: ouvertureConfig.dimensions,
          couleur: ouvertureConfig.couleur,
          surface: calculs.surface,
          volume: calculs.volume,
          murParent: typeMur as ProprietesOuverture['murParent'],
          dateCreation: new Date(),
          derniereModification: new Date()
        };
        ouvertures.push(ouverture);
      });
    });
    
    this.ouverturesActuelles.next(ouvertures);
  }

  /**
   * Calculer les propriétés géométriques d'une ouverture
   */
  private calculerProprietesOuverture(ouvertureConfig: ConfigurationOuverture): CalculsOuverture {
    const surface = ouvertureConfig.dimensions.width * ouvertureConfig.dimensions.height;
    const volume = surface * ouvertureConfig.dimensions.depth;
    const perimetre = 2 * (ouvertureConfig.dimensions.width + ouvertureConfig.dimensions.height);
    const ratioAspect = ouvertureConfig.dimensions.width / ouvertureConfig.dimensions.height;
    
    const centreGravite = {
      x: ouvertureConfig.position.x,
      y: ouvertureConfig.position.y + (ouvertureConfig.dimensions.height / 2),
      z: ouvertureConfig.position.z
    };

    return {
      surface: Math.round(surface * 100) / 100,
      volume: Math.round(volume * 100) / 100,
      perimetre: Math.round(perimetre * 100) / 100,
      centreGravite,
      ratioAspect: Math.round(ratioAspect * 100) / 100
    };
  }

  /**
   * Obtenir toutes les ouvertures
   */
  getOuvertures(): ProprietesOuverture[] {
    return this.ouverturesActuelles.value;
  }

  /**
   * Obtenir les ouvertures en tant qu'Observable
   */
  getOuverturesObservable(): Observable<ProprietesOuverture[]> {
    return this.ouvertures$;
  }

  /**
   * Obtenir une ouverture par son ID
   */
  getOuvertureParId(id: string): ProprietesOuverture | undefined {
    return this.ouverturesActuelles.value.find(ouverture => ouverture.id === id);
  }

  /**
   * Obtenir les ouvertures par type
   */
  getOuverturesParType(type: 'porte' | 'fenetre'): ProprietesOuverture[] {
    return this.ouverturesActuelles.value.filter(ouverture => ouverture.type === type);
  }

  /**
   * Obtenir toutes les portes
   */
  getPortes(): ProprietesOuverture[] {
    return this.getOuverturesParType('porte');
  }

  /**
   * Obtenir toutes les fenêtres
   */
  getFenetres(): ProprietesOuverture[] {
    return this.getOuverturesParType('fenetre');
  }

  /**
   * Obtenir les ouvertures d'un mur spécifique
   */
  getOuverturesParMur(murParent: ProprietesOuverture['murParent']): ProprietesOuverture[] {
    return this.ouverturesActuelles.value.filter(ouverture => ouverture.murParent === murParent);
  }

  /**
   * Ajouter une nouvelle ouverture
   */
  ajouterOuverture(
    murParent: ProprietesOuverture['murParent'],
    nouvelleOuverture: Omit<ConfigurationOuverture, 'id'>
  ): void {
    try {
      // Validation des paramètres
      if (!murParent || !nouvelleOuverture) {
        throw new Error('Paramètres manquants pour l\'ajout d\'ouverture');
      }
      
      if (!nouvelleOuverture.type || !nouvelleOuverture.dimensions || !nouvelleOuverture.position) {
        throw new Error('Ouverture incomplète: propriétés manquantes');
      }
      
      if (nouvelleOuverture.dimensions.width <= 0 || 
          nouvelleOuverture.dimensions.height <= 0 || 
          nouvelleOuverture.dimensions.depth <= 0) {
        throw new Error('Dimensions de l\'ouverture doivent être positives');
      }
      
      const id = `${nouvelleOuverture.type}_${Date.now()}`;
      const ouvertureComplete: ConfigurationOuverture = {
        ...nouvelleOuverture,
        id
      };
      
      this.configurationService.ajouterOuverture(murParent, ouvertureComplete);
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'ouverture:', error);
      throw error;
    }
  }

  /**
   * Supprimer une ouverture
   */
  supprimerOuverture(id: string): void {
    const ouverture = this.getOuvertureParId(id);
    if (ouverture) {
      this.configurationService.supprimerOuverture(ouverture.murParent, id);
    }
  }

  /**
   * Modifier la position d'une ouverture
   */
  modifierPositionOuverture(id: string, nouvellePosition: { x: number; y: number; z: number }): void {
    const ouverture = this.getOuvertureParId(id);
    if (ouverture) {
      // Mettre à jour dans la configuration
      const config = this.configurationService.getConfiguration();
      const murConfig = config.murs[ouverture.murParent];
      const ouvertureConfig = murConfig.ouvertures.find(o => o.id === id);
      
      if (ouvertureConfig) {
        ouvertureConfig.position = nouvellePosition;
        this.configurationService.mettreAJourMur(ouverture.murParent, murConfig);
      }
    }
  }

  /**
   * Modifier les dimensions d'une ouverture
   */
  modifierDimensionsOuverture(id: string, nouvellesDimensions: { width: number; height: number; depth: number }): void {
    const ouverture = this.getOuvertureParId(id);
    if (ouverture) {
      const config = this.configurationService.getConfiguration();
      const murConfig = config.murs[ouverture.murParent];
      const ouvertureConfig = murConfig.ouvertures.find(o => o.id === id);
      
      if (ouvertureConfig) {
        ouvertureConfig.dimensions = nouvellesDimensions;
        this.configurationService.mettreAJourMur(ouverture.murParent, murConfig);
      }
    }
  }

  /**
   * Modifier la couleur d'une ouverture
   */
  modifierCouleurOuverture(id: string, nouvelleCouleur: number): void {
    const ouverture = this.getOuvertureParId(id);
    if (ouverture) {
      const config = this.configurationService.getConfiguration();
      const murConfig = config.murs[ouverture.murParent];
      const ouvertureConfig = murConfig.ouvertures.find(o => o.id === id);
      
      if (ouvertureConfig) {
        ouvertureConfig.couleur = nouvelleCouleur;
        this.configurationService.mettreAJourMur(ouverture.murParent, murConfig);
      }
    }
  }

  /**
   * Valider une ouverture
   */
  validerOuverture(ouverture: ProprietesOuverture): ValidationOuverture {
    const erreurs: string[] = [];
    const avertissements: string[] = [];

    // Validation des dimensions
    if (ouverture.dimensions.width <= 0) {
      erreurs.push('La largeur de l\'ouverture doit être positive');
    }
    if (ouverture.dimensions.height <= 0) {
      erreurs.push('La hauteur de l\'ouverture doit être positive');
    }
    if (ouverture.dimensions.depth <= 0) {
      erreurs.push('La profondeur de l\'ouverture doit être positive');
    }

    // Validation spécifique aux portes
    if (ouverture.type === 'porte') {
      if (ouverture.dimensions.height < 2) {
        avertissements.push('La hauteur de la porte est inférieure à 2m');
      }
      if (ouverture.dimensions.width < 0.8) {
        avertissements.push('La largeur de la porte est inférieure à 80cm');
      }
      if (ouverture.dimensions.width > 1.2) {
        avertissements.push('La largeur de la porte est supérieure à 1.2m');
      }
    }

    // Validation spécifique aux fenêtres
    if (ouverture.type === 'fenetre') {
      if (ouverture.dimensions.height < 1) {
        avertissements.push('La hauteur de la fenêtre est inférieure à 1m');
      }
      if (ouverture.dimensions.width < 0.6) {
        avertissements.push('La largeur de la fenêtre est inférieure à 60cm');
      }
    }

    // Validation du ratio d'aspect
    const ratioAspect = ouverture.dimensions.width / ouverture.dimensions.height;
    if (ratioAspect > 3) {
      avertissements.push('Le ratio largeur/hauteur est très élevé (> 3)');
    }
    if (ratioAspect < 0.3) {
      avertissements.push('Le ratio largeur/hauteur est très faible (< 0.3)');
    }

    return {
      isValid: erreurs.length === 0,
      erreurs,
      avertissements
    };
  }

  /**
   * Obtenir les statistiques des ouvertures
   */
  getStatistiquesOuvertures(): StatistiquesOuvertures {
    const ouvertures = this.getOuvertures();
    const portes = this.getPortes();
    const fenetres = this.getFenetres();
    
    const nombreTotal = ouvertures.length;
    const nombrePortes = portes.length;
    const nombreFenetres = fenetres.length;
    
    const surfaceTotale = ouvertures.reduce((total, ouverture) => total + ouverture.surface, 0);
    const surfacePortes = portes.reduce((total, porte) => total + porte.surface, 0);
    const surfaceFenetres = fenetres.reduce((total, fenetre) => total + fenetre.surface, 0);
    
    const pourcentagePortes = surfaceTotale > 0 ? (surfacePortes / surfaceTotale) * 100 : 0;
    const pourcentageFenetres = surfaceTotale > 0 ? (surfaceFenetres / surfaceTotale) * 100 : 0;

    return {
      nombreTotal,
      nombrePortes,
      nombreFenetres,
      surfaceTotale: Math.round(surfaceTotale * 100) / 100,
      surfacePortes: Math.round(surfacePortes * 100) / 100,
      surfaceFenetres: Math.round(surfaceFenetres * 100) / 100,
      pourcentagePortes: Math.round(pourcentagePortes * 100) / 100,
      pourcentageFenetres: Math.round(pourcentageFenetres * 100) / 100
    };
  }

  /**
   * Obtenir la plus grande ouverture
   */
  getPlusGrandeOuverture(): ProprietesOuverture | undefined {
    const ouvertures = this.getOuvertures();
    if (ouvertures.length === 0) return undefined;
    
    return ouvertures.reduce((plusGrande, ouverture) => 
      ouverture.surface > plusGrande.surface ? ouverture : plusGrande
    );
  }

  /**
   * Obtenir la plus petite ouverture
   */
  getPlusPetiteOuverture(): ProprietesOuverture | undefined {
    const ouvertures = this.getOuvertures();
    if (ouvertures.length === 0) return undefined;
    
    return ouvertures.reduce((plusPetite, ouverture) => 
      ouverture.surface < plusPetite.surface ? ouverture : plusPetite
    );
  }

  /**
   * Obtenir les ouvertures par taille
   */
  getOuverturesParTaille(minSurface: number, maxSurface: number): ProprietesOuverture[] {
    return this.getOuvertures().filter(ouverture => 
      ouverture.surface >= minSurface && ouverture.surface <= maxSurface
    );
  }

  /**
   * Calculer la distance entre deux ouvertures
   */
  calculerDistanceEntreOuvertures(ouverture1: ProprietesOuverture, ouverture2: ProprietesOuverture): number {
    const dx = ouverture1.position.x - ouverture2.position.x;
    const dy = ouverture1.position.y - ouverture2.position.y;
    const dz = ouverture1.position.z - ouverture2.position.z;
    
    return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 100) / 100;
  }

  /**
   * Obtenir les ouvertures les plus proches
   */
  getOuverturesProches(ouverture: ProprietesOuverture, distanceMax: number = 2): ProprietesOuverture[] {
    const ouvertures = this.getOuvertures();
    const ouverturesProches: ProprietesOuverture[] = [];
    
    ouvertures.forEach(autreOuverture => {
      if (autreOuverture.id !== ouverture.id) {
        const distance = this.calculerDistanceEntreOuvertures(ouverture, autreOuverture);
        if (distance <= distanceMax) {
          ouverturesProches.push(autreOuverture);
        }
      }
    });
    
    return ouverturesProches;
  }

  /**
   * Obtenir les ouvertures par couleur
   */
  getOuverturesParCouleur(couleur: number): ProprietesOuverture[] {
    return this.getOuvertures().filter(ouverture => ouverture.couleur === couleur);
  }

  /**
   * Obtenir les couleurs utilisées
   */
  getCouleursUtilisees(): number[] {
    const ouvertures = this.getOuvertures();
    const couleurs = new Set<number>();
    
    ouvertures.forEach(ouverture => {
      couleurs.add(ouverture.couleur);
    });
    
    return Array.from(couleurs);
  }
}


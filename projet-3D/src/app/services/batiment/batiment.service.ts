import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigurationService, ConfigurationBatiment } from '../configuration/configuration.service';

/**
 * Interface pour les propriétés d'un bâtiment
 */
export interface ProprietesBatiment {
  nom: string;
  description: string;
  type: 'residentiel' | 'commercial' | 'industriel' | 'public';
  etage: number;
  surface: number; // en m²
  volume: number;   // en m³
  dateCreation: Date;
  derniereModification: Date;
}

/**
 * Interface pour les statistiques du bâtiment
 */
export interface StatistiquesBatiment {
  nombreMurs: number;
  nombreOuvertures: number;
  nombrePortes: number;
  nombreFenetres: number;
  surfaceMurs: number;
  surfaceOuvertures: number;
  pourcentageOuvertures: number;
}

/**
 * Service de gestion des bâtiments
 */
@Injectable({
  providedIn: 'root'
})
export class BatimentService {
  
  private proprietesBatiment = new BehaviorSubject<ProprietesBatiment>({
    nom: 'Bâtiment Principal',
    description: 'Bâtiment architectural avec murs, ouvertures et toit',
    type: 'residentiel',
    etage: 1,
    surface: 0,
    volume: 0,
    dateCreation: new Date(),
    derniereModification: new Date()
  });

  public proprietes$ = this.proprietesBatiment.asObservable();

  constructor(private configurationService: ConfigurationService) {
    // Calculer automatiquement la surface et le volume
    this.calculerSurfaceEtVolume();
    
    // Écouter les changements de configuration pour recalculer
    this.configurationService.getConfigurationObservable().subscribe(() => {
      this.calculerSurfaceEtVolume();
      this.mettreAJourDateModification();
    });
  }

  /**
   * Obtenir les propriétés du bâtiment
   */
  getProprietes(): ProprietesBatiment {
    return this.proprietesBatiment.value;
  }

  /**
   * Obtenir les propriétés en tant qu'Observable
   */
  getProprietesObservable(): Observable<ProprietesBatiment> {
    return this.proprietes$;
  }

  /**
   * Mettre à jour les propriétés du bâtiment
   */
  mettreAJourProprietes(nouvellesProprietes: Partial<ProprietesBatiment>): void {
    const proprietesActuelles = this.getProprietes();
    const proprietesMisesAJour = {
      ...proprietesActuelles,
      ...nouvellesProprietes,
      derniereModification: new Date()
    };
    
    this.proprietesBatiment.next(proprietesMisesAJour);
    console.log('Propriétés du bâtiment mises à jour:', proprietesMisesAJour);
  }

  /**
   * Calculer la surface et le volume du bâtiment
   */
  private calculerSurfaceEtVolume(): void {
    const config = this.configurationService.getConfiguration();
    const dimensions = config.dimensions;
    
    const surface = dimensions.longueur * dimensions.largeur;
    const volume = surface * dimensions.hauteur;
    
    this.mettreAJourProprietes({
      surface: Math.round(surface * 100) / 100, // Arrondir à 2 décimales
      volume: Math.round(volume * 100) / 100
    });
  }

  /**
   * Mettre à jour la date de dernière modification
   */
  private mettreAJourDateModification(): void {
    this.mettreAJourProprietes({
      derniereModification: new Date()
    });
  }

  /**
   * Obtenir les statistiques du bâtiment
   */
  getStatistiques(): StatistiquesBatiment {
    const config = this.configurationService.getConfiguration();
    const toutesOuvertures = this.configurationService.getAllOuvertures();
    
    const nombreMurs = 4; // principal, arrière, gauche, droit
    const nombreOuvertures = toutesOuvertures.length;
    const nombrePortes = toutesOuvertures.filter(o => o.type === 'porte').length;
    const nombreFenetres = toutesOuvertures.filter(o => o.type === 'fenetre').length;
    
    // Calculer la surface des murs
    const murs = config.murs;
    const surfaceMurs = 
      (murs.principal.dimensions.width * murs.principal.dimensions.height) +
      (murs.arriere.dimensions.width * murs.arriere.dimensions.height) +
      (murs.gauche.dimensions.width * murs.gauche.dimensions.height) +
      (murs.droit.dimensions.width * murs.droit.dimensions.height);
    
    // Calculer la surface des ouvertures
    const surfaceOuvertures = toutesOuvertures.reduce((total, ouverture) => {
      return total + (ouverture.dimensions.width * ouverture.dimensions.height);
    }, 0);
    
    const pourcentageOuvertures = surfaceMurs > 0 ? 
      Math.round((surfaceOuvertures / surfaceMurs) * 100 * 100) / 100 : 0;
    
    return {
      nombreMurs,
      nombreOuvertures,
      nombrePortes,
      nombreFenetres,
      surfaceMurs: Math.round(surfaceMurs * 100) / 100,
      surfaceOuvertures: Math.round(surfaceOuvertures * 100) / 100,
      pourcentageOuvertures
    };
  }

  /**
   * Obtenir le type de bâtiment
   */
  getTypeBatiment(): string {
    return this.getProprietes().type;
  }

  /**
   * Changer le type de bâtiment
   */
  changerTypeBatiment(nouveauType: ProprietesBatiment['type']): void {
    this.mettreAJourProprietes({ type: nouveauType });
  }

  /**
   * Obtenir la surface du bâtiment
   */
  getSurface(): number {
    return this.getProprietes().surface;
  }

  /**
   * Obtenir le volume du bâtiment
   */
  getVolume(): number {
    return this.getProprietes().volume;
  }

  /**
   * Obtenir le nom du bâtiment
   */
  getNom(): string {
    return this.getProprietes().nom;
  }

  /**
   * Changer le nom du bâtiment
   */
  changerNom(nouveauNom: string): void {
    this.mettreAJourProprietes({ nom: nouveauNom });
  }

  /**
   * Obtenir la description du bâtiment
   */
  getDescription(): string {
    return this.getProprietes().description;
  }

  /**
   * Changer la description du bâtiment
   */
  changerDescription(nouvelleDescription: string): void {
    this.mettreAJourProprietes({ description: nouvelleDescription });
  }

  /**
   * Obtenir la date de création
   */
  getDateCreation(): Date {
    return this.getProprietes().dateCreation;
  }

  /**
   * Obtenir la date de dernière modification
   */
  getDerniereModification(): Date {
    return this.getProprietes().derniereModification;
  }

  /**
   * Exporter les données du bâtiment
   */
  exporterDonnees(): string {
    const proprietes = this.getProprietes();
    const config = this.configurationService.getConfiguration();
    const statistiques = this.getStatistiques();
    
    const donneesExport = {
      proprietes,
      configuration: config,
      statistiques,
      dateExport: new Date()
    };
    
    return JSON.stringify(donneesExport, null, 2);
  }

  /**
   * Importer les données du bâtiment
   */
  importerDonnees(donneesJson: string): boolean {
    try {
      if (!donneesJson || donneesJson.trim() === '') {
        throw new Error('Données JSON vides ou invalides');
      }
      
      const donnees = JSON.parse(donneesJson);
      
      // Validation des données importées
      if (!donnees || typeof donnees !== 'object') {
        throw new Error('Format de données invalide');
      }
      
      if (donnees.proprietes) {
        // Validation des propriétés
        if (!donnees.proprietes.nom || !donnees.proprietes.type) {
          throw new Error('Propriétés du bâtiment incomplètes');
        }
        this.mettreAJourProprietes(donnees.proprietes);
      }
      
      if (donnees.configuration) {
        this.configurationService.mettreAJourConfiguration(donnees.configuration);
      }
      
      console.log('Données importées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  }
}


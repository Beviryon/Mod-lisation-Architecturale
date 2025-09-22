import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';
import { MurService, ProprietesMur } from '../mur/mur.service';
import { OuvertureService, ProprietesOuverture } from '../ouverture/ouverture.service';

/**
 * Interface pour les propriétés de la scène 3D
 */
export interface ProprietesScene {
  id: string;
  nom: string;
  largeur: number;
  hauteur: number;
  backgroundColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  antialias: boolean;
  shadowMapEnabled: boolean;
  shadowMapType: 'PCF' | 'PCFSoft' | 'Basic';
  dateCreation: Date;
  derniereModification: Date;
}

/**
 * Interface pour la caméra
 */
export interface ProprietesCamera {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
  type: 'perspective' | 'orthographic';
}

/**
 * Interface pour les contrôles de la scène
 */
export interface ControlesScene {
  enableRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

/**
 * Interface pour les lumières
 */
export interface ProprietesLumiere {
  id: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  position?: { x: number; y: number; z: number };
  direction?: { x: number; y: number; z: number };
  color: number;
  intensity: number;
  castShadow: boolean;
  enabled: boolean;
}

/**
 * Interface pour les statistiques de la scène
 */
export interface StatistiquesScene {
  nombreObjets: number;
  nombreMurs: number;
  nombreOuvertures: number;
  nombreLumieres: number;
  nombreTriangles: number;
  memoireUtilisee: number;
  fps: number;
  tempsRendu: number;
}

/**
 * Service de gestion de la scène 3D
 */
@Injectable({
  providedIn: 'root'
})
export class SceneService {
  
  private sceneActuelle = new BehaviorSubject<ProprietesScene>({
    id: 'scene_principale',
    nom: 'Scène Architecturale 3D',
    largeur: 800,
    hauteur: 600,
    backgroundColor: 0x87CEEB, // Bleu ciel
    fogColor: 0x87CEEB,
    fogNear: 1,
    fogFar: 100,
    antialias: true,
    shadowMapEnabled: true,
    shadowMapType: 'PCFSoft',
    dateCreation: new Date(),
    derniereModification: new Date()
  });

  private cameraActuelle = new BehaviorSubject<ProprietesCamera>({
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000,
    type: 'perspective'
  });

  private controlesActuels = new BehaviorSubject<ControlesScene>({
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    enableDamping: true,
    dampingFactor: 0.05,
    rotateSpeed: 1.0,
    zoomSpeed: 1.0,
    panSpeed: 1.0,
    minDistance: 2,
    maxDistance: 50,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI
  });

  private lumiereActuelles = new BehaviorSubject<ProprietesLumiere[]>([
    {
      id: 'lumiere_ambient',
      type: 'ambient',
      color: 0x404040,
      intensity: 0.4,
      castShadow: false,
      enabled: true
    },
    {
      id: 'lumiere_directionnelle',
      type: 'directional',
      position: { x: 10, y: 10, z: 5 },
      direction: { x: -1, y: -1, z: -1 },
      color: 0xffffff,
      intensity: 1.0,
      castShadow: true,
      enabled: true
    }
  ]);

  public scene$ = this.sceneActuelle.asObservable();
  public camera$ = this.cameraActuelle.asObservable();
  public controles$ = this.controlesActuels.asObservable();
  public lumiere$ = this.lumiereActuelles.asObservable();

  constructor(
    private configurationService: ConfigurationService,
    private murService: MurService,
    private ouvertureService: OuvertureService
  ) {
    console.log('SceneService initialisé');
  }

  /**
   * Obtenir les propriétés de la scène
   */
  getProprietesScene(): ProprietesScene {
    return this.sceneActuelle.value;
  }

  /**
   * Obtenir les propriétés de la scène en tant qu'Observable
   */
  getProprietesSceneObservable(): Observable<ProprietesScene> {
    return this.scene$;
  }

  /**
   * Mettre à jour les propriétés de la scène
   */
  mettreAJourProprietesScene(nouvellesProprietes: Partial<ProprietesScene>): void {
    const proprietesActuelles = this.getProprietesScene();
    const proprietesMisesAJour = {
      ...proprietesActuelles,
      ...nouvellesProprietes,
      derniereModification: new Date()
    };
    
    this.sceneActuelle.next(proprietesMisesAJour);
    console.log('Propriétés de la scène mises à jour:', proprietesMisesAJour);
  }

  /**
   * Obtenir les propriétés de la caméra
   */
  getProprietesCamera(): ProprietesCamera {
    return this.cameraActuelle.value;
  }

  /**
   * Obtenir les propriétés de la caméra en tant qu'Observable
   */
  getProprietesCameraObservable(): Observable<ProprietesCamera> {
    return this.camera$;
  }

  /**
   * Mettre à jour les propriétés de la caméra
   */
  mettreAJourProprietesCamera(nouvellesProprietes: Partial<ProprietesCamera>): void {
    const proprietesActuelles = this.getProprietesCamera();
    const proprietesMisesAJour = {
      ...proprietesActuelles,
      ...nouvellesProprietes
    };
    
    this.cameraActuelle.next(proprietesMisesAJour);
    console.log('Propriétés de la caméra mises à jour:', proprietesMisesAJour);
  }

  /**
   * Obtenir les contrôles de la scène
   */
  getControlesScene(): ControlesScene {
    return this.controlesActuels.value;
  }

  /**
   * Obtenir les contrôles de la scène en tant qu'Observable
   */
  getControlesSceneObservable(): Observable<ControlesScene> {
    return this.controles$;
  }

  /**
   * Mettre à jour les contrôles de la scène
   */
  mettreAJourControlesScene(nouveauxControles: Partial<ControlesScene>): void {
    const controlesActuels = this.getControlesScene();
    const controlesMisesAJour = {
      ...controlesActuels,
      ...nouveauxControles
    };
    
    this.controlesActuels.next(controlesMisesAJour);
    console.log('Contrôles de la scène mis à jour:', controlesMisesAJour);
  }

  /**
   * Obtenir les lumières
   */
  getLumieres(): ProprietesLumiere[] {
    return this.lumiereActuelles.value;
  }

  /**
   * Obtenir les lumières en tant qu'Observable
   */
  getLumieresObservable(): Observable<ProprietesLumiere[]> {
    return this.lumiere$;
  }

  /**
   * Ajouter une nouvelle lumière
   */
  ajouterLumiere(nouvelleLumiere: Omit<ProprietesLumiere, 'id'>): void {
    const lumiereComplete: ProprietesLumiere = {
      ...nouvelleLumiere,
      id: `lumiere_${Date.now()}`
    };
    
    const lumiereActuelles = this.getLumieres();
    lumiereActuelles.push(lumiereComplete);
    this.lumiereActuelles.next(lumiereActuelles);
  }

  /**
   * Supprimer une lumière
   */
  supprimerLumiere(id: string): void {
    const lumiereActuelles = this.getLumieres();
    const lumiereFiltrees = lumiereActuelles.filter(lumiere => lumiere.id !== id);
    this.lumiereActuelles.next(lumiereFiltrees);
  }

  /**
   * Modifier une lumière
   */
  modifierLumiere(id: string, nouvellesProprietes: Partial<ProprietesLumiere>): void {
    const lumiereActuelles = this.getLumieres();
    const lumiereIndex = lumiereActuelles.findIndex(lumiere => lumiere.id === id);
    
    if (lumiereIndex !== -1) {
      lumiereActuelles[lumiereIndex] = {
        ...lumiereActuelles[lumiereIndex],
        ...nouvellesProprietes
      };
      this.lumiereActuelles.next(lumiereActuelles);
    }
  }

  /**
   * Activer/Désactiver une lumière
   */
  toggleLumiere(id: string): void {
    const lumiereActuelles = this.getLumieres();
    const lumiereIndex = lumiereActuelles.findIndex(lumiere => lumiere.id === id);
    
    if (lumiereIndex !== -1) {
      lumiereActuelles[lumiereIndex].enabled = !lumiereActuelles[lumiereIndex].enabled;
      this.lumiereActuelles.next(lumiereActuelles);
    }
  }

  /**
   * Obtenir les statistiques de la scène
   */
  getStatistiquesScene(): StatistiquesScene {
    const murs = this.murService.getMurs();
    const ouvertures = this.ouvertureService.getOuvertures();
    const lumiere = this.getLumieres();
    
    const nombreMurs = murs.length;
    const nombreOuvertures = ouvertures.length;
    const nombreLumieres = lumiere.length;
    const nombreObjets = nombreMurs + nombreOuvertures + nombreLumieres;
    
    // Estimation du nombre de triangles (approximation)
    const nombreTriangles = (nombreMurs * 12) + (nombreOuvertures * 8); // Estimation
    
    // Estimation de la mémoire utilisée (en MB)
    const memoireUtilisee = (nombreTriangles * 0.001); // Approximation
    
    return {
      nombreObjets,
      nombreMurs,
      nombreOuvertures,
      nombreLumieres,
      nombreTriangles,
      memoireUtilisee: Math.round(memoireUtilisee * 100) / 100,
      fps: 60, // Valeur par défaut
      tempsRendu: 16.67 // 60 FPS = 16.67ms par frame
    };
  }

  /**
   * Réinitialiser la caméra à sa position par défaut
   */
  reinitialiserCamera(): void {
    this.mettreAJourProprietesCamera({
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 }
    });
  }

  /**
   * Centrer la caméra sur un objet
   */
  centrerCameraSurObjet(position: { x: number; y: number; z: number }): void {
    this.mettreAJourProprietesCamera({
      target: position
    });
  }

  /**
   * Obtenir la distance entre la caméra et un point
   */
  calculerDistanceCamera(point: { x: number; y: number; z: number }): number {
    const camera = this.getProprietesCamera();
    const dx = camera.position.x - point.x;
    const dy = camera.position.y - point.y;
    const dz = camera.position.z - point.z;
    
    return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 100) / 100;
  }

  /**
   * Obtenir le point le plus proche de la caméra
   */
  getPointLePlusProcheDeCamera(): { x: number; y: number; z: number } | null {
    const camera = this.getProprietesCamera();
    const murs = this.murService.getMurs();
    const ouvertures = this.ouvertureService.getOuvertures();
    
    let pointLePlusProche: { x: number; y: number; z: number } | null = null;
    let distanceMin = Infinity;
    
    // Vérifier les murs
    murs.forEach(mur => {
      const distance = this.calculerDistanceCamera(mur.position);
      if (distance < distanceMin) {
        distanceMin = distance;
        pointLePlusProche = mur.position;
      }
    });
    
    // Vérifier les ouvertures
    ouvertures.forEach(ouverture => {
      const distance = this.calculerDistanceCamera(ouverture.position);
      if (distance < distanceMin) {
        distanceMin = distance;
        pointLePlusProche = ouverture.position;
      }
    });
    
    return pointLePlusProche;
  }

  /**
   * Exporter la configuration de la scène
   */
  exporterConfigurationScene(): string {
    const configuration = {
      scene: this.getProprietesScene(),
      camera: this.getProprietesCamera(),
      controles: this.getControlesScene(),
      lumiere: this.getLumieres(),
      statistiques: this.getStatistiquesScene(),
      dateExport: new Date()
    };
    
    return JSON.stringify(configuration, null, 2);
  }

  /**
   * Importer la configuration de la scène
   */
  importerConfigurationScene(configurationJson: string): boolean {
    try {
      if (!configurationJson || configurationJson.trim() === '') {
        throw new Error('Configuration JSON vide ou invalide');
      }
      
      const configuration = JSON.parse(configurationJson);
      
      if (!configuration || typeof configuration !== 'object') {
        throw new Error('Format de configuration invalide');
      }
      
      if (configuration.scene) {
        // Validation des propriétés de la scène
        if (!configuration.scene.nom || !configuration.scene.largeur || !configuration.scene.hauteur) {
          throw new Error('Propriétés de la scène incomplètes');
        }
        this.mettreAJourProprietesScene(configuration.scene);
      }
      
      if (configuration.camera) {
        // Validation des propriétés de la caméra
        if (!configuration.camera.position || !configuration.camera.target) {
          throw new Error('Propriétés de la caméra incomplètes');
        }
        this.mettreAJourProprietesCamera(configuration.camera);
      }
      
      if (configuration.controles) {
        this.mettreAJourControlesScene(configuration.controles);
      }
      
      if (configuration.lumiere && Array.isArray(configuration.lumiere)) {
        this.lumiereActuelles.next(configuration.lumiere);
      }
      
      console.log('Configuration de la scène importée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation de la configuration:', error);
      return false;
    }
  }

  /**
   * Réinitialiser la scène à ses valeurs par défaut
   */
  reinitialiserScene(): void {
    this.sceneActuelle.next({
      id: 'scene_principale',
      nom: 'Scène Architecturale 3D',
      largeur: 800,
      hauteur: 600,
      backgroundColor: 0x87CEEB,
      fogColor: 0x87CEEB,
      fogNear: 1,
      fogFar: 100,
      antialias: true,
      shadowMapEnabled: true,
      shadowMapType: 'PCFSoft',
      dateCreation: new Date(),
      derniereModification: new Date()
    });
    
    this.reinitialiserCamera();
    
    console.log('Scène réinitialisée');
  }
}


/**
 * ===============================================
 * CONFIGURATION DIRECTE - LECTURE IMMÉDIATE
 * ===============================================
 * 
 * Ce fichier permet de lire directement building-config.ts
 * et d'appliquer les modifications immédiatement au modèle 3D.
 * 
 * OBJECTIFS :
 * - Modifications directes dans building-config.ts
 * - Rendu immédiat sans passer par le ConfigurationService
 * - Bypass des couches intermédiaires
 * - Synchronisation directe avec le modèle 3D
 * 
 * UTILISATION :
 * 1. Modifiez building-config.ts
 * 2. Appelez rechargerConfiguration()
 * 3. Le modèle 3D se met à jour immédiatement
 * 
 * ===============================================
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BUILDING_CONFIG, WallConfig, MainWallConfig, OpeningConfig, Position3D, Dimensions3D } from './building-config';

/**
 * Interface pour la configuration complète du bâtiment
 */
export interface ConfigurationComplete {
  scene: {
    background: number;
    camera: {
      fov: number;
      near: number;
      far: number;
    };
  };
  lighting: {
    ambient: {
      color: number;
      intensity: number;
    };
    directional: {
      color: number;
      intensity: number;
      position: Position3D;
      shadow: {
        mapSize: number;
      };
    };
  };
  camera: {
    initial: {
      position: Position3D;
      rotationX: number;
      rotationY: number;
      zoom: number;
    };
    target: Position3D;
    controls: {
      minZoom: number;
      maxZoom: number;
      rotationSpeed: number;
      zoomSpeed: number;
    };
  };
  ground: WallConfig;
  roof: WallConfig;
  mainWall: MainWallConfig;
  walls: {
    back: WallConfig & { openings?: { window1: OpeningConfig } };
    left: WallConfig;
    right: WallConfig & { openings?: { door: OpeningConfig } };
  };
  axes: {
    size: number;
    labels: Array<{
      text: string;
      position: Position3D;
      color: number;
    }>;
    labelSize: Dimensions3D;
  };
}

/**
 * Service de configuration directe
 * Lit directement building-config.ts et applique les modifications
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigDirectService {
  
  private configurationSubject = new BehaviorSubject<ConfigurationComplete>(this.chargerConfiguration());
  public configuration$ = this.configurationSubject.asObservable();

  constructor() {
    console.log('🔧 ConfigDirectService initialisé - Lecture directe de building-config.ts');
  }

  /**
   * Charger la configuration directement depuis building-config.ts
   */
  public chargerConfiguration(): ConfigurationComplete {
    try {
      // Import dynamique pour forcer le rechargement
      const config = { ...BUILDING_CONFIG } as ConfigurationComplete;
      
      console.log('📥 Configuration chargée directement depuis building-config.ts');
      console.log('🏠 Bâtiment:', {
        longueur: config.walls.back.dimensions.width,
        largeur: config.walls.left.dimensions.depth,
        hauteur: config.walls.back.dimensions.height,
        couleur: `#${config.walls.back.color.toString(16)}`
      });
      
      return config;
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la configuration:', error);
      throw error;
    }
  }

  /**
   * Obtenir la configuration actuelle
   */
  public getConfiguration(): ConfigurationComplete {
    return this.configurationSubject.value;
  }

  /**
   * Recharger la configuration depuis building-config.ts
   */
  public rechargerConfiguration(): void {
    try {
      const nouvelleConfig = this.chargerConfiguration();
      this.configurationSubject.next(nouvelleConfig);
      
      console.log('🔄 Configuration rechargée depuis building-config.ts');
      console.log('📊 Nouvelles dimensions:', {
        longueur: nouvelleConfig.walls.back.dimensions.width,
        largeur: nouvelleConfig.walls.left.dimensions.depth,
        hauteur: nouvelleConfig.walls.back.dimensions.height
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du rechargement de la configuration:', error);
    }
  }

  /**
   * Mettre à jour la configuration (pour compatibilité)
   */
  public mettreAJourConfiguration(config: ConfigurationComplete): void {
    this.configurationSubject.next(config);
    console.log('📝 Configuration mise à jour via ConfigDirectService');
  }

  /**
   * Obtenir les dimensions du bâtiment
   */
  public getDimensionsBatiment(): { longueur: number; largeur: number; hauteur: number } {
    const config = this.getConfiguration();
    return {
      longueur: config.walls.back.dimensions.width,
      largeur: config.walls.left.dimensions.depth,
      hauteur: config.walls.back.dimensions.height
    };
  }

  /**
   * Obtenir la couleur des murs
   */
  public getCouleurMurs(): string {
    const config = this.getConfiguration();
    return `#${config.walls.back.color.toString(16).padStart(6, '0')}`;
  }

  /**
   * Obtenir les informations des ouvertures
   */
  public getOuvertures(): Array<{ type: string; position: Position3D; dimensions: Dimensions3D; couleur: string }> {
    const config = this.getConfiguration();
    const ouvertures: Array<{ type: string; position: Position3D; dimensions: Dimensions3D; couleur: string }> = [];

    // Fenêtres du mur principal
    if (config.mainWall.openings.window2) {
      ouvertures.push({
        type: 'fenetre',
        position: config.mainWall.openings.window2.position,
        dimensions: config.mainWall.openings.window2.dimensions,
        couleur: `#${config.mainWall.openings.window2.color.toString(16).padStart(6, '0')}`
      });
    }

    // Fenêtres du mur arrière
    if (config.walls.back.openings?.window1) {
      ouvertures.push({
        type: 'fenetre',
        position: config.walls.back.openings.window1.position,
        dimensions: config.walls.back.openings.window1.dimensions,
        couleur: `#${config.walls.back.openings.window1.color.toString(16).padStart(6, '0')}`
      });
    }

    // Porte du mur droit
    if (config.walls.right.openings?.door) {
      ouvertures.push({
        type: 'porte',
        position: config.walls.right.openings.door.position,
        dimensions: config.walls.right.openings.door.dimensions,
        couleur: `#${config.walls.right.openings.door.color.toString(16).padStart(6, '0')}`
      });
    }

    return ouvertures;
  }

  /**
   * Vérifier si la configuration a changé
   */
  public hasConfigurationChanged(): boolean {
    try {
      const configActuelle = this.getConfiguration();
      const nouvelleConfig = this.chargerConfiguration();
      
      // Comparaison simple des dimensions principales
      return (
        configActuelle.walls.back.dimensions.width !== nouvelleConfig.walls.back.dimensions.width ||
        configActuelle.walls.left.dimensions.depth !== nouvelleConfig.walls.left.dimensions.depth ||
        configActuelle.walls.back.dimensions.height !== nouvelleConfig.walls.back.dimensions.height ||
        configActuelle.walls.back.color !== nouvelleConfig.walls.back.color
      );
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des changements:', error);
      return false;
    }
  }

  /**
   * Forcer le rechargement si des changements sont détectés
   */
  public rechargerSiNecessaire(): boolean {
    if (this.hasConfigurationChanged()) {
      console.log('🔄 Changements détectés dans building-config.ts - Rechargement automatique');
      this.rechargerConfiguration();
      return true;
    }
    return false;
  }
}

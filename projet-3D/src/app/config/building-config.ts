/**
 * ===============================================
 * CONFIGURATION DU BÂTIMENT 3D
 * ===============================================
 * 
 * Ce fichier centralise toutes les données du modèle 3D architectural.
 * Au lieu d'avoir des valeurs en dur dispersées dans le code, tout est ici !
 * 
 * OBJECTIFS :
 * - Éliminer les "magic numbers" (valeurs en dur)
 * - Faciliter les modifications (changer une couleur, une dimension, etc.)
 * - Rendre le code plus maintenable et professionnel
 * - Permettre une évolution facile du projet
 * 
 * STRUCTURE :
 * 1. INTERFACES : Définissent la forme des données
 * 2. CONFIGURATION : Toutes les valeurs du bâtiment
 * 3. UTILITAIRES : Fonctions de calcul automatique
 * 
 * UTILISATION :
 * Pour modifier le bâtiment, il suffit de changer les valeurs dans 
 * BUILDING_CONFIG ci-dessous. Le code s'adaptera automatiquement !
 * 
 * ===============================================
 */

/**
 * ===============================================
 * INTERFACES - DÉFINITION DES STRUCTURES DE DONNÉES
 * ===============================================
 * Ces interfaces définissent la forme des objets de configuration
 */

/**
 * Position 3D dans l'espace
 * @param x - Coordonnée X (gauche/droite)
 * @param y - Coordonnée Y (bas/haut)
 * @param z - Coordonnée Z (avant/arrière)
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Dimensions 3D d'un objet
 * @param width - Largeur (axe X)
 * @param height - Hauteur (axe Y)
 * @param depth - Profondeur (axe Z)
 */
export interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

/**
 * Configuration d'un mur simple
 * @param position - Position du centre du mur
 * @param dimensions - Taille du mur
 * @param color - Couleur hexadécimale (ex: 0xaaaaaa)
 */
export interface WallConfig {
  position: Position3D;
  dimensions: Dimensions3D;
  color: number;
}

/**
 * Configuration d'une ouverture (porte ou fenêtre)
 * @param position - Position du centre de l'ouverture
 * @param dimensions - Taille de l'ouverture
 * @param color - Couleur de l'élément
 * @param type - Type d'ouverture ('door' ou 'window')
 */
export interface OpeningConfig {
  position: Position3D;
  dimensions: Dimensions3D;
  color: number;
  type: 'door' | 'window';
}

/**
 * Configuration du mur principal avec ouvertures (façade)
 * @param contour - Points définissant la forme du mur
 * @param thickness - Épaisseur du mur
 * @param position - Position du mur dans l'espace
 * @param color - Couleur du mur
 * @param openings - Ouvertures (porte et fenêtres) dans ce mur
 */
export interface MainWallConfig {
  contour: Position3D[];
  thickness: number;
  position: Position3D;
  color: number;
  openings: {
    door: OpeningConfig;
    window1: OpeningConfig;
    window2: OpeningConfig;
  };
}

/**
 * Configuration de la caméra et des contrôles
 * @param initial - Position et paramètres initiaux de la caméra
 * @param target - Point que la caméra regarde
 * @param controls - Paramètres des contrôles souris
 */
export interface CameraConfig {
  initial: {
    position: Position3D;
    rotationX: number;  // Rotation verticale
    rotationY: number;  // Rotation horizontale
    zoom: number;       // Distance de la caméra
  };
  target: Position3D;   // Point central regardé par la caméra
  controls: {
    minZoom: number;      // Distance minimale
    maxZoom: number;      // Distance maximale
    rotationSpeed: number; // Vitesse de rotation
    zoomSpeed: number;     // Vitesse de zoom
  };
}

/**
 * Configuration de l'éclairage de la scène
 * @param ambient - Lumière ambiante (éclairage général)
 * @param directional - Lumière directionnelle (comme le soleil)
 */
export interface LightingConfig {
  ambient: {
    color: number;      // Couleur de la lumière ambiante
    intensity: number;  // Intensité (0-1)
  };
  directional: {
    color: number;      // Couleur de la lumière directionnelle
    intensity: number;  // Intensité
    position: Position3D; // Position de la source lumineuse
    shadow: {
      mapSize: number;  // Qualité des ombres (résolution)
    };
  };
}

/**
 * Configuration générale de la scène 3D
 * @param background - Couleur de fond de la scène
 * @param camera - Paramètres de la caméra (champ de vision, distances)
 */
export interface SceneConfig {
  background: number;   // Couleur de fond (ex: 0xbfd1e5 = bleu ciel)
  camera: {
    fov: number;        // Champ de vision (field of view) en degrés
    near: number;       // Distance de rendu minimale
    far: number;        // Distance de rendu maximale
  };
}

/**
 * ===============================================
 * CONFIGURATION PRINCIPALE DU BÂTIMENT
 * ===============================================
 * Toutes les données du modèle 3D sont centralisées ici
 */
export const BUILDING_CONFIG = {
  
  /**
   * SCÈNE 3D - Paramètres généraux
   */
  scene: {
    background: 0xbfd1e5,  // Couleur bleu ciel pour le fond
    camera: {
      fov: 75,             // Angle de vue (75° = vue naturelle)
      near: 0.1,           // Objets plus proches que 0.1 non rendus
      far: 1000            // Objets plus loin que 1000 non rendus
    }
  } as SceneConfig,

  /**
   * ÉCLAIRAGE - Lumières de la scène
   */
  lighting: {
    ambient: {   
      color: 0xffffff,     // Lumière blanche ambiante
      intensity: 0.6       // 60% d'intensité (éclairage doux)
    },
    directional: {
      color: 0xffffff,     // Lumière blanche directionnelle (soleil)
      intensity: 1,        // 100% d'intensité
      position: { x: 10, y: 20, z: 10 }, // Position du "soleil"
      shadow: {
        mapSize: 2048      // Résolution des ombres (2048x2048)
      }
    }
  } as LightingConfig,

  /**
   * CAMÉRA - Point de vue et contrôles
   */
  camera: {
    initial: {
      position: { x: 10, y: 10, z: 9 }, // Position initiale de la caméra
      rotationX: 0.3,                   // Inclinaison verticale
      rotationY: 0.5,                   // Rotation horizontale
      zoom: 15                          // Distance initiale
    },
    target: { x: 0, y: 1.25, z: 0 },   // Point regardé (centre du bâtiment)
    controls: {
      minZoom: 5,           // Distance minimale (zoom max)
      maxZoom: 50,          // Distance maximale (zoom min)
      rotationSpeed: 0.01,  // Sensibilité de rotation souris
      zoomSpeed: 0.01       // Sensibilité du zoom molette
    }
  } as CameraConfig,

  /**
   * SOL - Plateforme de base
   */
  ground: {
    position: { x: 0, y: -0.1, z: 0 }, // Légèrement sous le niveau 0
    dimensions: { width: 8, height: 0.2, depth: 5 }, // 8x5m, épaisseur 20cm
    color: 0x2E1E1A  
  } as WallConfig,

  /**
   * TOIT - Couverture du bâtiment
   */
  roof: {
    position: { x: 0, y: 2.6, z: 0 },  // Au-dessus des murs (2.5m + 0.1m)
    dimensions: { width: 8.4, height: 0.2, depth: 5 }, 
    color: 0x4169e1       // Couleur bleu royal
  } as WallConfig,

  /**
   * MUR PRINCIPAL (FAÇADE) - Mur avec ouvertures
   * Ce mur utilise ExtrudeGeometry pour créer de vraies ouvertures
   */
  mainWall: {
    contour: [
      // Points définissant la forme rectangulaire du mur (8m x 2.5m)
      { x: -4, y: 0, z: 0 },    // Coin bas gauche
      { x: 4, y: 0, z: 0 },     // Coin bas droit
      { x: 4, y: 2.5, z: 0 },   // Coin haut droit
      { x: -4, y: 2.5, z: 0 },  // Coin haut gauche
      { x: -4, y: 0, z: 0 }     // Retour au point de départ
    ],
    thickness: 0.2,             // Épaisseur du mur (20cm)
    position: { x: 0, y: 0, z: 2.3 }, // Position du mur dans l'espace
    color: 0xaaaaaa,            // Couleur gris clair
    openings: {
      // PORTE CENTRALE
      door: {
        position: { x: 0, y: 1.05, z: 2.3 },
        dimensions: { width: 1, height: 2, depth: 0.05 }, // 1m x 2m
        color: 0x00ff00,        // Couleur verte
        type: 'door' as const
      },
      // PREMIÈRE FENÊTRE (gauche)
      window1: {
        position: { x: -2, y: 1.5, z: 2.3 }, 
        dimensions: { width: 1.5, height: 1.2, depth: 0.05 }, // 1.5m x 1.2m
        color: 0xff0000,        // Couleur rouge
        type: 'window' as const
      },
      // DEUXIÈME FENÊTRE (droite)
      window2: {
        position: { x: 2, y: 1.5, z: 2.3 }, 
        dimensions: { width: 1.5, height: 1.2, depth: 0.05 }, // 1.5m x 1.2m
        color: 0xff0000,        // Couleur rouge
        type: 'window' as const
      }
    }
  } as MainWallConfig,


  /**
   * AUTRES MURS - Murs latéraux et arrière (murs pleins)
   */
  walls: {
    // MUR ARRIÈRE
    back: {
      position: { x: 0, y: 0, z: -2.5 },
      dimensions: { width: 8, height: 2.5, depth: 0.2 }, // 8m x 2.5m x 20cm
      color: 0xaaaaaa,
      openings: {
        window1: {
          position: { x: 0, y: 1.5, z: -2.2 },
          dimensions: { width: 1.5, height: 1.2, depth: 0.05 }, // 1.5m x 1.2m
          color: 0xff0000,        // Couleur rouge
          type: 'window' as const
        }
      }
    },
    // MUR GAUCHE
    left: {
      position: { x: -3.9, y: 1.25, z: 0 }, 
      dimensions: { width: 0.2, height: 2.5, depth: 5 }, // 20cm x 2.5m x 5m
      color: 0xaaaaaa,
      openings: {
        window5: {
          position: { x: -3.8, y: 1.5, z: 0 },
          dimensions: { width: 1.2, height: 1.0, depth: 0.05 }, // 1.2m x 1m
          color: 0xff0000,        // Couleur rouge
          type: 'window' as const
        }
      }
      // Couleur gris clair
    },
    // MUR DROIT
    right: {
      position: { x: 3.8, y: 0, z: 0 },
      dimensions: { width: 0.2, height: 2.5, depth: 5 }, // 20cm x 2.5m x 5m
      color: 0xaaaaaa,
      openings: {
        // PORTE D'ENTRÉE
        door: {
          position: { x: 3.8, y: 1.05, z: 0 },
          dimensions: { width: 1, height: 2.1, depth: 0.05 }, // 1m x 2.1m
          color: 0x00ff00,        // Couleur verte
          type: 'door' as const
        },
        // FENÊTRE
        window1: {
          position: { x: 3.8, y: 1.5, z: 1.5 },
          dimensions: { width: 1.2, height: 1.0, depth: 0.05 }, // 1.2m x 1m
          color: 0xff0000,        // Couleur rouge
          type: 'window' as const
        }
      }
    }
  },

  /**
   * AXES DE RÉFÉRENCE (REPÈRE) - Pour s'orienter dans l'espace
   */
  axes: {
    size: 8,                  // Longueur des axes (8 unités)
    labels: [
      // Axe X (rouge) - gauche/droite
      { text: 'X', position: { x: 10, y: 0, z: 0 }, color: 0xff0000 },
      // Axe Y (vert) - bas/haut
      { text: 'Y', position: { x: 0, y: 10, z: 0 }, color: 0x00ff00 },
      // Axe Z (bleu) - avant/arrière
      { text: 'Z', position: { x: 0, y: 0, z: 10 }, color: 0x0000ff }
    ],
    labelSize: { width: 0.2, height: 0.2, depth: 0.2 } // Taille des cubes de repère
  }
};

/**
 * ===============================================
 * FONCTIONS UTILITAIRES
 * ===============================================
 * Calculs automatiques pour les ouvertures dans les murs
 */
export class WallCalculations {
  
  /**
   * Calcule les coordonnées d'une ouverture de porte
   * @param config - Configuration de la porte
   * @returns Points définissant le trou rectangulaire pour la porte
   */
  static getDoorHole(config: OpeningConfig) {
    const halfWidth = config.dimensions.width / 2;  // Demi-largeur de la porte
    return [
      // Rectangle partant du sol (y=0) jusqu'à la hauteur de la porte
      { x: config.position.x - halfWidth, y: 0 },                    // Bas gauche
      { x: config.position.x + halfWidth, y: 0 },                    // Bas droit
      { x: config.position.x + halfWidth, y: config.dimensions.height }, // Haut droit
      { x: config.position.x - halfWidth, y: config.dimensions.height }, // Haut gauche
      { x: config.position.x - halfWidth, y: 0 }                     // Retour au début
    ];
  }

  /**
   * Calcule les coordonnées d'une ouverture de fenêtre
   * @param config - Configuration de la fenêtre
   * @param bottomOffset - Distance du sol au bas de la fenêtre (par défaut 0.9m)
   * @returns Points définissant le trou rectangulaire pour la fenêtre
   */
  static getWindowHole(config: OpeningConfig, bottomOffset: number = 0.9) {
    const halfWidth = config.dimensions.width / 2;  // Demi-largeur de la fenêtre
    const bottom = bottomOffset;                     // Position du bas de la fenêtre
    const top = bottom + config.dimensions.height;  // Position du haut de la fenêtre
    
    return [
      // Rectangle surélevé par rapport au sol
      { x: config.position.x - halfWidth, y: bottom }, // Bas gauche
      { x: config.position.x + halfWidth, y: bottom }, // Bas droit
      { x: config.position.x + halfWidth, y: top },    // Haut droit
      { x: config.position.x - halfWidth, y: top },    // Haut gauche
      { x: config.position.x - halfWidth, y: bottom }  // Retour au début
    ];
  }

}
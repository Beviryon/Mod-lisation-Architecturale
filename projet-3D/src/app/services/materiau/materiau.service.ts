import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface pour les propriétés d'un matériau
 */
export interface ProprietesMateriau {
  id: string;
  nom: string;
  type: 'mur' | 'porte' | 'fenetre' | 'toit' | 'sol' | 'decoration';
  couleur: number;
  couleurHex: string;
  couleurRgb: { r: number; g: number; b: number };
  couleurHsl: { h: number; s: number; l: number };
  texture?: string;
  rugosite: number; // 0 = lisse, 1 = rugueux
  metallic: number; // 0 = non métallique, 1 = métallique
  transparent: boolean;
  opacity: number; // 0 = transparent, 1 = opaque
  emissive: number; // Couleur émissive
  emissiveIntensity: number;
  dateCreation: Date;
  derniereModification: Date;
}

/**
 * Interface pour les palettes de couleurs
 */
export interface PaletteCouleurs {
  id: string;
  nom: string;
  description: string;
  couleurs: number[];
  type: 'architecturale' | 'moderne' | 'classique' | 'naturelle' | 'personnalisee';
  dateCreation: Date;
}

/**
 * Interface pour les textures
 */
export interface ProprietesTexture {
  id: string;
  nom: string;
  url: string;
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emissive';
  resolution: { width: number; height: number };
  format: 'jpg' | 'png' | 'webp';
  taille: number; // en KB
}

/**
 * Interface pour les statistiques des matériaux
 */
export interface StatistiquesMateriaux {
  nombreTotal: number;
  nombreParType: Record<string, number>;
  couleursUtilisees: number[];
  texturesUtilisees: string[];
  paletteLaPlusUtilisee: string;
  materiauLePlusUtilise: string;
}

/**
 * Service de gestion des matériaux et couleurs
 */
@Injectable({
  providedIn: 'root'
})
export class MateriauService {
  
  private materiauxActuels = new BehaviorSubject<ProprietesMateriau[]>([]);
  private palettesActuelles = new BehaviorSubject<PaletteCouleurs[]>([]);
  private texturesActuelles = new BehaviorSubject<ProprietesTexture[]>([]);

  public materiaux$ = this.materiauxActuels.asObservable();
  public palettes$ = this.palettesActuelles.asObservable();
  public textures$ = this.texturesActuelles.asObservable();

  constructor() {
    this.initialiserMateriauxParDefaut();
    this.initialiserPalettesParDefaut();
    this.initialiserTexturesParDefaut();
  }

  /**
   * Initialiser les matériaux par défaut
   */
  private initialiserMateriauxParDefaut(): void {
    const materiaux: ProprietesMateriau[] = [
      // Matériaux pour murs
      {
        id: 'mur_beton',
        nom: 'Béton Gris',
        type: 'mur',
        couleur: 0xaaaaaa,
        couleurHex: '#aaaaaa',
        couleurRgb: { r: 170, g: 170, b: 170 },
        couleurHsl: { h: 0, s: 0, l: 67 },
        rugosite: 0.7,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      {
        id: 'mur_brique',
        nom: 'Brique Rouge',
        type: 'mur',
        couleur: 0x8b4513,
        couleurHex: '#8b4513',
        couleurRgb: { r: 139, g: 69, b: 19 },
        couleurHsl: { h: 25, s: 76, l: 31 },
        rugosite: 0.8,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      {
        id: 'mur_bois',
        nom: 'Bois Naturel',
        type: 'mur',
        couleur: 0xdeb887,
        couleurHex: '#deb887',
        couleurRgb: { r: 222, g: 184, b: 135 },
        couleurHsl: { h: 34, s: 57, l: 70 },
        rugosite: 0.6,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      
      // Matériaux pour portes
      {
        id: 'porte_bois_vert',
        nom: 'Porte Bois Vert',
        type: 'porte',
        couleur: 0x00ff00,
        couleurHex: '#00ff00',
        couleurRgb: { r: 0, g: 255, b: 0 },
        couleurHsl: { h: 120, s: 100, l: 50 },
        rugosite: 0.4,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      {
        id: 'porte_bois_brun',
        nom: 'Porte Bois Brun',
        type: 'porte',
        couleur: 0x8b4513,
        couleurHex: '#8b4513',
        couleurRgb: { r: 139, g: 69, b: 19 },
        couleurHsl: { h: 25, s: 76, l: 31 },
        rugosite: 0.3,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      
      // Matériaux pour fenêtres
      {
        id: 'fenetre_bleue',
        nom: 'Fenêtre Bleue',
        type: 'fenetre',
        couleur: 0x0000ff,
        couleurHex: '#0000ff',
        couleurRgb: { r: 0, g: 0, b: 255 },
        couleurHsl: { h: 240, s: 100, l: 50 },
        rugosite: 0.1,
        metallic: 0.0,
        transparent: true,
        opacity: 0.8,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      {
        id: 'fenetre_rouge',
        nom: 'Fenêtre Rouge',
        type: 'fenetre',
        couleur: 0xff0000,
        couleurHex: '#ff0000',
        couleurRgb: { r: 255, g: 0, b: 0 },
        couleurHsl: { h: 0, s: 100, l: 50 },
        rugosite: 0.1,
        metallic: 0.0,
        transparent: true,
        opacity: 0.8,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      
      // Matériaux pour toit
      {
        id: 'toit_bleu',
        nom: 'Toit Bleu Royal',
        type: 'toit',
        couleur: 0x4169e1,
        couleurHex: '#4169e1',
        couleurRgb: { r: 65, g: 105, b: 225 },
        couleurHsl: { h: 225, s: 73, l: 57 },
        rugosite: 0.5,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      },
      
      // Matériaux pour sol
      {
        id: 'sol_marron',
        nom: 'Sol Marron',
        type: 'sol',
        couleur: 0x8b4513,
        couleurHex: '#8b4513',
        couleurRgb: { r: 139, g: 69, b: 19 },
        couleurHsl: { h: 25, s: 76, l: 31 },
        rugosite: 0.9,
        metallic: 0.0,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        dateCreation: new Date(),
        derniereModification: new Date()
      }
    ];
    
    this.materiauxActuels.next(materiaux);
  }

  /**
   * Initialiser les palettes par défaut
   */
  private initialiserPalettesParDefaut(): void {
    const palettes: PaletteCouleurs[] = [
      {
        id: 'palette_moderne',
        nom: 'Palette Moderne',
        description: 'Couleurs modernes et épurées',
        couleurs: [0xaaaaaa, 0xffffff, 0x000000, 0x4169e1, 0x00ff00],
        type: 'moderne',
        dateCreation: new Date()
      },
      {
        id: 'palette_classique',
        nom: 'Palette Classique',
        description: 'Couleurs traditionnelles et chaleureuses',
        couleurs: [0x8b4513, 0xdeb887, 0x654321, 0xffd700, 0xcd853f],
        type: 'classique',
        dateCreation: new Date()
      },
      {
        id: 'palette_naturelle',
        nom: 'Palette Naturelle',
        description: 'Couleurs inspirées de la nature',
        couleurs: [0x228b22, 0x8fbc8f, 0x2e8b57, 0x90ee90, 0x32cd32],
        type: 'naturelle',
        dateCreation: new Date()
      },
      {
        id: 'palette_architecturale',
        nom: 'Palette Architecturale',
        description: 'Couleurs professionnelles pour l\'architecture',
        couleurs: [0xaaaaaa, 0x696969, 0x2f4f4f, 0x708090, 0x778899],
        type: 'architecturale',
        dateCreation: new Date()
      }
    ];
    
    this.palettesActuelles.next(palettes);
  }

  /**
   * Initialiser les textures par défaut
   */
  private initialiserTexturesParDefaut(): void {
    const textures: ProprietesTexture[] = [
      {
        id: 'texture_beton',
        nom: 'Texture Béton',
        url: '/assets/textures/beton.jpg',
        type: 'diffuse',
        resolution: { width: 512, height: 512 },
        format: 'jpg',
        taille: 256
      },
      {
        id: 'texture_brique',
        nom: 'Texture Brique',
        url: '/assets/textures/brique.jpg',
        type: 'diffuse',
        resolution: { width: 512, height: 512 },
        format: 'jpg',
        taille: 312
      },
      {
        id: 'texture_bois',
        nom: 'Texture Bois',
        url: '/assets/textures/bois.jpg',
        type: 'diffuse',
        resolution: { width: 512, height: 512 },
        format: 'jpg',
        taille: 198
      }
    ];
    
    this.texturesActuelles.next(textures);
  }

  /**
   * Convertir une couleur hexadécimale en RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convertir une couleur RGB en HSL
   */
  rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convertir une couleur numérique en hexadécimale
   */
  numberToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  /**
   * Obtenir tous les matériaux
   */
  getMateriaux(): ProprietesMateriau[] {
    return this.materiauxActuels.value;
  }

  /**
   * Obtenir les matériaux en tant qu'Observable
   */
  getMateriauxObservable(): Observable<ProprietesMateriau[]> {
    return this.materiaux$;
  }

  /**
   * Obtenir un matériau par son ID
   */
  getMateriauParId(id: string): ProprietesMateriau | undefined {
    return this.materiauxActuels.value.find(materiau => materiau.id === id);
  }

  /**
   * Obtenir les matériaux par type
   */
  getMateriauxParType(type: ProprietesMateriau['type']): ProprietesMateriau[] {
    return this.materiauxActuels.value.filter(materiau => materiau.type === type);
  }

  /**
   * Obtenir les matériaux pour murs
   */
  getMateriauxMurs(): ProprietesMateriau[] {
    return this.getMateriauxParType('mur');
  }

  /**
   * Obtenir les matériaux pour portes
   */
  getMateriauxPortes(): ProprietesMateriau[] {
    return this.getMateriauxParType('porte');
  }

  /**
   * Obtenir les matériaux pour fenêtres
   */
  getMateriauxFenetres(): ProprietesMateriau[] {
    return this.getMateriauxParType('fenetre');
  }

  /**
   * Ajouter un nouveau matériau
   */
  ajouterMateriau(nouveauMateriau: Omit<ProprietesMateriau, 'id' | 'dateCreation' | 'derniereModification'>): void {
    try {
      // Validation des paramètres
      if (!nouveauMateriau) {
        throw new Error('Matériau manquant');
      }
      
      if (!nouveauMateriau.nom || !nouveauMateriau.type) {
        throw new Error('Nom et type du matériau requis');
      }
      
      if (typeof nouveauMateriau.couleur !== 'number' || nouveauMateriau.couleur < 0 || nouveauMateriau.couleur > 0xFFFFFF) {
        throw new Error('Couleur invalide: doit être un nombre entre 0 et 16777215');
      }
      
      const materiauComplete: ProprietesMateriau = {
        ...nouveauMateriau,
        id: `materiau_${Date.now()}`,
        dateCreation: new Date(),
        derniereModification: new Date()
      };
      
      const materiauxActuels = this.getMateriaux();
      materiauxActuels.push(materiauComplete);
      this.materiauxActuels.next(materiauxActuels);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du matériau:', error);
      throw error;
    }
  }

  /**
   * Modifier un matériau
   */
  modifierMateriau(id: string, nouvellesProprietes: Partial<ProprietesMateriau>): void {
    const materiauxActuels = this.getMateriaux();
    const materiauIndex = materiauxActuels.findIndex(materiau => materiau.id === id);
    
    if (materiauIndex !== -1) {
      materiauxActuels[materiauIndex] = {
        ...materiauxActuels[materiauIndex],
        ...nouvellesProprietes,
        derniereModification: new Date()
      };
      this.materiauxActuels.next(materiauxActuels);
    }
  }

  /**
   * Supprimer un matériau
   */
  supprimerMateriau(id: string): void {
    const materiauxActuels = this.getMateriaux();
    const materiauxFiltres = materiauxActuels.filter(materiau => materiau.id !== id);
    this.materiauxActuels.next(materiauxFiltres);
  }

  /**
   * Obtenir toutes les palettes
   */
  getPalettes(): PaletteCouleurs[] {
    return this.palettesActuelles.value;
  }

  /**
   * Obtenir les palettes en tant qu'Observable
   */
  getPalettesObservable(): Observable<PaletteCouleurs[]> {
    return this.palettes$;
  }

  /**
   * Obtenir une palette par son ID
   */
  getPaletteParId(id: string): PaletteCouleurs | undefined {
    return this.palettesActuelles.value.find(palette => palette.id === id);
  }

  /**
   * Obtenir les palettes par type
   */
  getPalettesParType(type: PaletteCouleurs['type']): PaletteCouleurs[] {
    return this.palettesActuelles.value.filter(palette => palette.type === type);
  }

  /**
   * Ajouter une nouvelle palette
   */
  ajouterPalette(nouvellePalette: Omit<PaletteCouleurs, 'id' | 'dateCreation'>): void {
    const paletteComplete: PaletteCouleurs = {
      ...nouvellePalette,
      id: `palette_${Date.now()}`,
      dateCreation: new Date()
    };
    
    const palettesActuelles = this.getPalettes();
    palettesActuelles.push(paletteComplete);
    this.palettesActuelles.next(palettesActuelles);
  }

  /**
   * Obtenir toutes les textures
   */
  getTextures(): ProprietesTexture[] {
    return this.texturesActuelles.value;
  }

  /**
   * Obtenir les textures en tant qu'Observable
   */
  getTexturesObservable(): Observable<ProprietesTexture[]> {
    return this.textures$;
  }

  /**
   * Obtenir une texture par son ID
   */
  getTextureParId(id: string): ProprietesTexture | undefined {
    return this.texturesActuelles.value.find(texture => texture.id === id);
  }

  /**
   * Obtenir les textures par type
   */
  getTexturesParType(type: ProprietesTexture['type']): ProprietesTexture[] {
    return this.texturesActuelles.value.filter(texture => texture.type === type);
  }

  /**
   * Ajouter une nouvelle texture
   */
  ajouterTexture(nouvelleTexture: Omit<ProprietesTexture, 'id'>): void {
    const textureComplete: ProprietesTexture = {
      ...nouvelleTexture,
      id: `texture_${Date.now()}`
    };
    
    const texturesActuelles = this.getTextures();
    texturesActuelles.push(textureComplete);
    this.texturesActuelles.next(texturesActuelles);
  }

  /**
   * Obtenir les statistiques des matériaux
   */
  getStatistiquesMateriaux(): StatistiquesMateriaux {
    const materiaux = this.getMateriaux();
    const palettes = this.getPalettes();
    const textures = this.getTextures();
    
    const nombreTotal = materiaux.length;
    const nombreParType: Record<string, number> = {};
    
    materiaux.forEach(materiau => {
      nombreParType[materiau.type] = (nombreParType[materiau.type] || 0) + 1;
    });
    
    const couleursUtilisees = materiaux.map(materiau => materiau.couleur);
    const texturesUtilisees = materiaux
      .filter(materiau => materiau.texture)
      .map(materiau => materiau.texture!);
    
    const paletteLaPlusUtilisee = palettes.length > 0 ? palettes[0].nom : 'Aucune';
    const materiauLePlusUtilise = Object.keys(nombreParType).reduce((a, b) => 
      nombreParType[a] > nombreParType[b] ? a : b
    );

    return {
      nombreTotal,
      nombreParType,
      couleursUtilisees,
      texturesUtilisees,
      paletteLaPlusUtilisee,
      materiauLePlusUtilise
    };
  }

  /**
   * Générer une couleur aléatoire
   */
  genererCouleurAleatoire(): number {
    return Math.floor(Math.random() * 16777215);
  }

  /**
   * Générer une palette de couleurs harmonieuses
   */
  genererPaletteHarmonieuse(couleurBase: number, nombreCouleurs: number = 5): number[] {
    const couleurs: number[] = [couleurBase];
    const rgb = this.hexToRgb(this.numberToHex(couleurBase));
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    for (let i = 1; i < nombreCouleurs; i++) {
      const nouvelleTeinte = (hsl.h + (i * 60)) % 360;
      const nouvelleCouleur = this.hslToRgb(nouvelleTeinte, hsl.s, hsl.l);
      couleurs.push(this.rgbToNumber(nouvelleCouleur.r, nouvelleCouleur.g, nouvelleCouleur.b));
    }
    
    return couleurs;
  }

  /**
   * Convertir HSL en RGB
   */
  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Convertir RGB en nombre
   */
  private rgbToNumber(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Exporter les matériaux
   */
  exporterMateriaux(): string {
    const donnees = {
      materiaux: this.getMateriaux(),
      palettes: this.getPalettes(),
      textures: this.getTextures(),
      statistiques: this.getStatistiquesMateriaux(),
      dateExport: new Date()
    };
    
    return JSON.stringify(donnees, null, 2);
  }

  /**
   * Importer les matériaux
   */
  importerMateriaux(donneesJson: string): boolean {
    try {
      const donnees = JSON.parse(donneesJson);
      
      if (donnees.materiaux) {
        this.materiauxActuels.next(donnees.materiaux);
      }
      
      if (donnees.palettes) {
        this.palettesActuelles.next(donnees.palettes);
      }
      
      if (donnees.textures) {
        this.texturesActuelles.next(donnees.textures);
      }
      
      console.log('Matériaux importés avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des matériaux:', error);
      return false;
    }
  }
}


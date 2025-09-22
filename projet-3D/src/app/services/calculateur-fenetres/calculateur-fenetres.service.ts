/**
 * ===============================================
 * CALCULATEUR DE FENÊTRES INTELLIGENT
 * ===============================================
 * 
 * Ce service calcule automatiquement le nombre maximum de fenêtres
 * qu'un mur peut contenir selon ses dimensions et les contraintes définies.
 * 
 * FONCTIONNALITÉS :
 * - Calcul automatique du nombre max de fenêtres
 * - Vérification des contraintes d'espacement
 * - Génération automatique des positions
 * - Validation des dimensions
 * 
 * ===============================================
 */

import { Injectable } from '@angular/core';

export interface FenetreConfig {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  color: number;
  type: 'window';
}

export interface MurConfig {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  color: number;
}

export interface CalculFenetres {
  nombreMaxFenetres: number;
  largeurFenetreOptimale: number;
  ecartOptimal: number;
  positionsCalculees: Array<{ x: number; y: number; z: number }>;
  largeurTotaleUtilisee: number;
  margeRestante: number;
  isValid: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalculateurFenetresService {

  // Contraintes par défaut
  private readonly CONTRAINTES = {
    largeurFenetreMin: 0.5,      // Largeur minimale d'une fenêtre (m)
    largeurFenetreMax: 3.0,      // Largeur maximale d'une fenêtre (m)
    hauteurFenetreMin: 0.8,      // Hauteur minimale d'une fenêtre (m)
    hauteurFenetreMax: 2.5,      // Hauteur maximale d'une fenêtre (m)
    ecartMin: 0.1,               // Écart minimum entre fenêtres (m)
    ecartMax: 2.0,               // Écart maximum entre fenêtres (m)
    margeMin: 0.2,               // Marge minimum des bords du mur (m)
    hauteurMurMin: 1.0           // Hauteur minimale du mur (m)
  };

  constructor() {
    console.log('CalculateurFenetresService initialisé');
  }

  /**
   * Calcule le nombre maximum de fenêtres pour un mur donné
   */
  public calculerNombreMaxFenetres(
    mur: MurConfig,
    largeurFenetre: number = 1.5,
    ecart: number = 0.5,
    hauteurFenetre: number = 1.2
  ): CalculFenetres {
    
    console.log('Calcul du nombre max de fenêtres pour le mur:', {
      largeurMur: mur.dimensions.width,
      hauteurMur: mur.dimensions.height,
      largeurFenetre,
      ecart,
      hauteurFenetre
    });

    // Validation des contraintes
    const validation = this.validerContraintes(mur, largeurFenetre, ecart, hauteurFenetre);
    if (!validation.isValid) {
      return {
        nombreMaxFenetres: 0,
        largeurFenetreOptimale: 0,
        ecartOptimal: 0,
        positionsCalculees: [],
        largeurTotaleUtilisee: 0,
        margeRestante: 0,
        isValid: false,
        message: validation.message
      };
    }

    // Calcul du nombre maximum de fenêtres
    const largeurDisponible = mur.dimensions.width - (2 * this.CONTRAINTES.margeMin);
    const largeurParFenetre = largeurFenetre + ecart;
    const nombreMaxFenetres = Math.floor(largeurDisponible / largeurParFenetre);

    // Calcul des positions optimales
    const positions = this.calculerPositionsOptimales(
      mur, 
      nombreMaxFenetres, 
      largeurFenetre, 
      ecart, 
      hauteurFenetre
    );

    // Calcul de la largeur totale utilisée
    const largeurTotaleUtilisee = (nombreMaxFenetres * largeurFenetre) + ((nombreMaxFenetres - 1) * ecart);
    const margeRestante = mur.dimensions.width - largeurTotaleUtilisee;

    const resultat: CalculFenetres = {
      nombreMaxFenetres,
      largeurFenetreOptimale: largeurFenetre,
      ecartOptimal: ecart,
      positionsCalculees: positions,
      largeurTotaleUtilisee,
      margeRestante,
      isValid: true,
      message: `✅ ${nombreMaxFenetres} fenêtre(s) possible(s) avec ${margeRestante.toFixed(2)}m de marge`
    };

    console.log(' Résultat du calcul:', resultat);
    return resultat;
  }

  /**
   * Calcule les positions optimales pour les fenêtres
   */
  private calculerPositionsOptimales(
    mur: MurConfig,
    nombreFenetres: number,
    largeurFenetre: number,
    ecart: number,
    hauteurFenetre: number
  ): Array<{ x: number; y: number; z: number }> {
    
    const positions: Array<{ x: number; y: number; z: number }> = [];
    
    if (nombreFenetres === 0) {
      return positions;
    }

    // Calcul de la largeur totale utilisée
    const largeurTotale = (nombreFenetres * largeurFenetre) + ((nombreFenetres - 1) * ecart);
    
    // Position de départ (centrée)
    const debut = mur.position.x - (largeurTotale / 2) + (largeurFenetre / 2);
    
    // Hauteur des fenêtres (centrée verticalement)
    const hauteurMur = mur.dimensions.height;
    const yPosition = mur.position.y + (hauteurMur / 2) - (hauteurFenetre / 2);
    
    // Calcul des positions
    for (let i = 0; i < nombreFenetres; i++) {
      const xPosition = debut + (i * (largeurFenetre + ecart));
      
      positions.push({
        x: xPosition,
        y: yPosition,
        z: mur.position.z
      });
    }

    return positions;
  }

  /**
   * Valide les contraintes d'espacement
   */
  private validerContraintes(
    mur: MurConfig,
    largeurFenetre: number,
    ecart: number,
    hauteurFenetre: number
  ): { isValid: boolean; message: string } {
    
    // Vérification de la largeur de la fenêtre
    if (largeurFenetre < this.CONTRAINTES.largeurFenetreMin) {
      return {
        isValid: false,
        message: `❌ Largeur de fenêtre trop petite (min: ${this.CONTRAINTES.largeurFenetreMin}m)`
      };
    }
    
    if (largeurFenetre > this.CONTRAINTES.largeurFenetreMax) {
      return {
        isValid: false,
        message: `❌ Largeur de fenêtre trop grande (max: ${this.CONTRAINTES.largeurFenetreMax}m)`
      };
    }

    // Vérification de la hauteur de la fenêtre
    if (hauteurFenetre < this.CONTRAINTES.hauteurFenetreMin) {
      return {
        isValid: false,
        message: `❌ Hauteur de fenêtre trop petite (min: ${this.CONTRAINTES.hauteurFenetreMin}m)`
      };
    }
    
    if (hauteurFenetre > this.CONTRAINTES.hauteurFenetreMax) {
      return {
        isValid: false,
        message: `❌ Hauteur de fenêtre trop grande (max: ${this.CONTRAINTES.hauteurFenetreMax}m)`
      };
    }

    // Vérification de l'écart
    if (ecart < this.CONTRAINTES.ecartMin) {
      return {
        isValid: false,
        message: `❌ Écart trop petit (min: ${this.CONTRAINTES.ecartMin}m)`
      };
    }
    
    if (ecart > this.CONTRAINTES.ecartMax) {
      return {
        isValid: false,
        message: `❌ Écart trop grand (max: ${this.CONTRAINTES.ecartMax}m)`
      };
    }

    // Vérification de la hauteur du mur
    if (mur.dimensions.height < this.CONTRAINTES.hauteurMurMin) {
      return {
        isValid: false,
        message: `❌ Mur trop bas (min: ${this.CONTRAINTES.hauteurMurMin}m)`
      };
    }

    // Vérification que la fenêtre rentre dans le mur
    if (hauteurFenetre > mur.dimensions.height) {
      return {
        isValid: false,
        message: `❌ Fenêtre trop haute pour le mur (mur: ${mur.dimensions.height}m, fenêtre: ${hauteurFenetre}m)`
      };
    }

    // Vérification de l'espace disponible
    const largeurDisponible = mur.dimensions.width - (2 * this.CONTRAINTES.margeMin);
    const largeurMinimale = largeurFenetre + ecart;
    
    if (largeurDisponible < largeurMinimale) {
      return {
        isValid: false,
        message: `❌ Pas assez d'espace (disponible: ${largeurDisponible}m, nécessaire: ${largeurMinimale}m)`
      };
    }

    return {
      isValid: true,
      message: '✅ Contraintes respectées'
    };
  }

  /**
   * Génère automatiquement la configuration des fenêtres pour un mur
   */
  public genererConfigurationFenetres(
    mur: MurConfig,
    nombreFenetres: number,
    largeurFenetre: number = 1.5,
    ecart: number = 0.5,
    hauteurFenetre: number = 1.2,
    couleur: number = 0xff0000
  ): { fenetres: FenetreConfig[]; isValid: boolean; message: string } {
    
    const calcul = this.calculerNombreMaxFenetres(mur, largeurFenetre, ecart, hauteurFenetre);
    
    if (!calcul.isValid) {
      return {
        fenetres: [],
        isValid: false,
        message: calcul.message
      };
    }

    if (nombreFenetres > calcul.nombreMaxFenetres) {
      return {
        fenetres: [],
        isValid: false,
        message: `❌ Trop de fenêtres demandées (max: ${calcul.nombreMaxFenetres})`
      };
    }

    const fenetres: FenetreConfig[] = [];
    
    for (let i = 0; i < nombreFenetres; i++) {
      const position = calcul.positionsCalculees[i];
      
      fenetres.push({
        position: {
          x: position.x,
          y: position.y,
          z: position.z
        },
        dimensions: {
          width: largeurFenetre,
          height: hauteurFenetre,
          depth: 0.05
        },
        color: couleur,
        type: 'window'
      });
    }

    return {
      fenetres,
      isValid: true,
      message: `✅ ${nombreFenetres} fenêtre(s) générée(s) avec succès`
    };
  }

  /**
   * Optimise automatiquement les dimensions pour un nombre de fenêtres donné
   */
  public optimiserDimensions(
    mur: MurConfig,
    nombreFenetres: number,
    hauteurFenetre: number = 1.2
  ): { largeurFenetre: number; ecart: number; isValid: boolean; message: string } {
    
    if (nombreFenetres === 0) {
      return {
        largeurFenetre: 0,
        ecart: 0,
        isValid: false,
        message: '❌ Nombre de fenêtres doit être > 0'
      };
    }

    const largeurDisponible = mur.dimensions.width - (2 * this.CONTRAINTES.margeMin);
    
    // Calcul de l'écart optimal (équilibre entre fenêtres et espacement)
    const ecartOptimal = Math.max(this.CONTRAINTES.ecartMin, largeurDisponible * 0.1);
    
    // Calcul de la largeur de fenêtre optimale
    const largeurFenetreOptimale = (largeurDisponible - ((nombreFenetres - 1) * ecartOptimal)) / nombreFenetres;
    
    // Vérification des contraintes
    if (largeurFenetreOptimale < this.CONTRAINTES.largeurFenetreMin) {
      return {
        largeurFenetre: 0,
        ecart: 0,
        isValid: false,
        message: `❌ Impossible d'optimiser pour ${nombreFenetres} fenêtres`
      };
    }

    return {
      largeurFenetre: Math.min(largeurFenetreOptimale, this.CONTRAINTES.largeurFenetreMax),
      ecart: ecartOptimal,
      isValid: true,
      message: `✅ Dimensions optimisées: ${largeurFenetreOptimale.toFixed(2)}m × ${ecartOptimal.toFixed(2)}m`
    };
  }

  /**
   * Analyse tous les murs et retourne leurs capacités
   */
  public analyserCapaciteMurs(murs: { [key: string]: MurConfig }): { [key: string]: CalculFenetres } {
    const resultats: { [key: string]: CalculFenetres } = {};
    
    Object.entries(murs).forEach(([nomMur, mur]) => {
      resultats[nomMur] = this.calculerNombreMaxFenetres(mur);
    });
    
    return resultats;
  }
}

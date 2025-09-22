import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';

/**
 * Interface pour les résultats de validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // Score de 0 à 100
  timestamp: Date;
}

/**
 * Interface pour les erreurs de validation
 */
export interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
}

/**
 * Interface pour les avertissements de validation
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  suggestion?: string;
}

/**
 * Interface pour les règles de validation
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'dimensions' | 'proportions' | 'materials' | 'safety' | 'aesthetics';
  weight: number; // Poids de la règle (1-10)
  enabled: boolean;
}

/**
 * Interface pour les statistiques de validation
 */
export interface ValidationStats {
  totalValidations: number;
  successRate: number;
  averageScore: number;
  errorsByCategory: Record<string, number>;
  warningsByCategory: Record<string, number>;
  lastValidation: Date | null;
}

/**
 * Service de validation architecturale
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  private validationRules: ValidationRule[] = [];
  private validationHistory: ValidationResult[] = [];
  private statsSubject = new BehaviorSubject<ValidationStats>({
    totalValidations: 0,
    successRate: 0,
    averageScore: 0,
    errorsByCategory: {},
    warningsByCategory: {},
    lastValidation: null
  });

  public stats$ = this.statsSubject.asObservable();

  constructor(private communicationService: CommunicationService) {
    this.initializeValidationRules();
    console.log('ValidationService initialisé');
  }

  /**
   * Initialiser les règles de validation
   */
  private initializeValidationRules(): void {
    this.validationRules = [
      // Règles de dimensions
      {
        id: 'wall_thickness_min',
        name: 'Épaisseur minimale des murs',
        description: 'Les murs doivent avoir une épaisseur minimale de 10cm',
        category: 'dimensions',
        weight: 8,
        enabled: true
      },
      {
        id: 'wall_thickness_max',
        name: 'Épaisseur maximale des murs',
        description: 'Les murs ne doivent pas dépasser 1m d\'épaisseur',
        category: 'dimensions',
        weight: 5,
        enabled: true
      },
      {
        id: 'door_height_min',
        name: 'Hauteur minimale des portes',
        description: 'Les portes doivent faire au moins 2m de haut',
        category: 'dimensions',
        weight: 9,
        enabled: true
      },
      {
        id: 'door_width_min',
        name: 'Largeur minimale des portes',
        description: 'Les portes doivent faire au moins 80cm de large',
        category: 'dimensions',
        weight: 9,
        enabled: true
      },
      {
        id: 'window_height_min',
        name: 'Hauteur minimale des fenêtres',
        description: 'Les fenêtres doivent faire au moins 1m de haut',
        category: 'dimensions',
        weight: 6,
        enabled: true
      },

      // Règles de proportions
      {
        id: 'opening_ratio_max',
        name: 'Ratio d\'ouvertures maximum',
        description: 'Les ouvertures ne doivent pas représenter plus de 50% de la surface des murs',
        category: 'proportions',
        weight: 7,
        enabled: true
      },
      {
        id: 'aspect_ratio_reasonable',
        name: 'Ratio d\'aspect raisonnable',
        description: 'Le ratio largeur/hauteur des ouvertures doit être entre 0.3 et 3',
        category: 'proportions',
        weight: 4,
        enabled: true
      },

      // Règles de sécurité
      {
        id: 'exit_accessibility',
        name: 'Accessibilité des sorties',
        description: 'Au moins une porte doit être accessible depuis chaque pièce',
        category: 'safety',
        weight: 10,
        enabled: true
      },
      {
        id: 'window_placement',
        name: 'Placement des fenêtres',
        description: 'Les fenêtres doivent être placées à une hauteur raisonnable',
        category: 'safety',
        weight: 6,
        enabled: true
      },

      // Règles esthétiques
      {
        id: 'color_harmony',
        name: 'Harmonie des couleurs',
        description: 'Les couleurs doivent être harmonieuses',
        category: 'aesthetics',
        weight: 3,
        enabled: true
      },
      {
        id: 'symmetry_preference',
        name: 'Préférence pour la symétrie',
        description: 'La symétrie est préférable pour l\'esthétique',
        category: 'aesthetics',
        weight: 2,
        enabled: true
      }
    ];
  }

  /**
   * Valider un bâtiment complet
   */
  validateBuilding(buildingData: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // Valider les murs
    if (buildingData.murs) {
      Object.entries(buildingData.murs).forEach(([wallType, wallData]: [string, any]) => {
        const wallValidation = this.validateWall(wallData, wallType);
        errors.push(...wallValidation.errors);
        warnings.push(...wallValidation.warnings);
        totalScore += wallValidation.score;
        maxScore += 100;
      });
    }

    // Valider les ouvertures
    if (buildingData.murs) {
      Object.entries(buildingData.murs).forEach(([wallType, wallData]: [string, any]) => {
        if (wallData.ouvertures) {
          wallData.ouvertures.forEach((opening: any) => {
            const openingValidation = this.validateOpening(opening, wallType);
            errors.push(...openingValidation.errors);
            warnings.push(...openingValidation.warnings);
            totalScore += openingValidation.score;
            maxScore += 100;
          });
        }
      });
    }

    // Valider les proportions globales
    const proportionsValidation = this.validateProportions(buildingData);
    errors.push(...proportionsValidation.errors);
    warnings.push(...proportionsValidation.warnings);
    totalScore += proportionsValidation.score;
    maxScore += 100;

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    const result: ValidationResult = {
      isValid,
      errors,
      warnings,
      score: finalScore,
      timestamp: new Date()
    };

    this.validationHistory.push(result);
    this.updateStats();
    
    // Émettre l'événement de validation
    this.communicationService.emitValidationResult(result);

    return result;
  }

  /**
   * Valider un mur
   */
  validateWall(wallData: any, wallType: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Épaisseur minimale
    if (wallData.epaisseur < 0.1) {
      errors.push({
        code: 'wall_thickness_min',
        message: `Le mur ${wallType} a une épaisseur trop faible (${wallData.epaisseur}m)`,
        field: 'epaisseur',
        severity: 'high',
        suggestion: 'Augmenter l\'épaisseur à au moins 0.1m'
      });
      score -= 20;
    }

    // Épaisseur maximale
    if (wallData.epaisseur > 1.0) {
      warnings.push({
        code: 'wall_thickness_max',
        message: `Le mur ${wallType} a une épaisseur très importante (${wallData.epaisseur}m)`,
        field: 'epaisseur',
        suggestion: 'Considérer une épaisseur plus standard'
      });
      score -= 10;
    }

    // Dimensions raisonnables
    if (wallData.dimensions.height < 2.0) {
      errors.push({
        code: 'wall_height_min',
        message: `Le mur ${wallType} est trop bas (${wallData.dimensions.height}m)`,
        field: 'dimensions.height',
        severity: 'medium',
        suggestion: 'Augmenter la hauteur à au moins 2m'
      });
      score -= 15;
    }

    return {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Valider une ouverture
   */
  validateOpening(openingData: any, wallType: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    if (openingData.type === 'porte') {
      // Hauteur minimale des portes
      if (openingData.dimensions.height < 2.0) {
        errors.push({
          code: 'door_height_min',
          message: `La porte sur le mur ${wallType} est trop basse (${openingData.dimensions.height}m)`,
          field: 'dimensions.height',
          severity: 'high',
          suggestion: 'Augmenter la hauteur à au moins 2m'
        });
        score -= 25;
      }

      // Largeur minimale des portes
      if (openingData.dimensions.width < 0.8) {
        errors.push({
          code: 'door_width_min',
          message: `La porte sur le mur ${wallType} est trop étroite (${openingData.dimensions.width}m)`,
          field: 'dimensions.width',
          severity: 'high',
          suggestion: 'Augmenter la largeur à au moins 0.8m'
        });
        score -= 25;
      }

      // Largeur maximale des portes
      if (openingData.dimensions.width > 1.2) {
        warnings.push({
          code: 'door_width_max',
          message: `La porte sur le mur ${wallType} est très large (${openingData.dimensions.width}m)`,
          field: 'dimensions.width',
          suggestion: 'Considérer une largeur plus standard'
        });
        score -= 10;
      }
    }

    if (openingData.type === 'fenetre') {
      // Hauteur minimale des fenêtres
      if (openingData.dimensions.height < 1.0) {
        errors.push({
          code: 'window_height_min',
          message: `La fenêtre sur le mur ${wallType} est trop basse (${openingData.dimensions.height}m)`,
          field: 'dimensions.height',
          severity: 'medium',
          suggestion: 'Augmenter la hauteur à au moins 1m'
        });
        score -= 20;
      }

      // Ratio d'aspect des fenêtres
      const aspectRatio = openingData.dimensions.width / openingData.dimensions.height;
      if (aspectRatio < 0.3 || aspectRatio > 3) {
        warnings.push({
          code: 'aspect_ratio_reasonable',
          message: `La fenêtre sur le mur ${wallType} a un ratio d'aspect inhabituel (${aspectRatio.toFixed(2)})`,
          field: 'dimensions',
          suggestion: 'Considérer un ratio entre 0.3 et 3'
        });
        score -= 15;
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Valider les proportions globales
   */
  validateProportions(buildingData: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Calculer le pourcentage d'ouvertures
    let totalWallSurface = 0;
    let totalOpeningSurface = 0;

    if (buildingData.murs) {
      Object.values(buildingData.murs).forEach((wall: any) => {
        totalWallSurface += wall.dimensions.width * wall.dimensions.height;
        if (wall.ouvertures) {
          wall.ouvertures.forEach((opening: any) => {
            totalOpeningSurface += opening.dimensions.width * opening.dimensions.height;
          });
        }
      });
    }

    const openingPercentage = totalWallSurface > 0 ? (totalOpeningSurface / totalWallSurface) * 100 : 0;

    if (openingPercentage > 50) {
      errors.push({
        code: 'opening_ratio_max',
        message: `Trop d'ouvertures (${openingPercentage.toFixed(1)}% de la surface des murs)`,
        field: 'ouvertures',
        severity: 'medium',
        suggestion: 'Réduire le nombre ou la taille des ouvertures'
      });
      score -= 30;
    } else if (openingPercentage > 30) {
      warnings.push({
        code: 'opening_ratio_high',
        message: `Beaucoup d'ouvertures (${openingPercentage.toFixed(1)}% de la surface des murs)`,
        field: 'ouvertures',
        suggestion: 'Vérifier l\'isolation thermique'
      });
      score -= 10;
    }

    return {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      timestamp: new Date()
    };
  }

  /**
   * Obtenir les règles de validation
   */
  getValidationRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Activer/désactiver une règle
   */
  toggleRule(ruleId: string): void {
    const rule = this.validationRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      console.log(`Règle ${ruleId} ${rule.enabled ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Obtenir l'historique des validations
   */
  getValidationHistory(): ValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Obtenir les statistiques de validation
   */
  getStats(): ValidationStats {
    return this.statsSubject.value;
  }

  /**
   * Obtenir les statistiques en tant qu'Observable
   */
  getStatsObservable(): Observable<ValidationStats> {
    return this.stats$;
  }

  /**
   * Mettre à jour les statistiques
   */
  private updateStats(): void {
    const totalValidations = this.validationHistory.length;
    const successfulValidations = this.validationHistory.filter(v => v.isValid).length;
    const successRate = totalValidations > 0 ? (successfulValidations / totalValidations) * 100 : 0;
    const averageScore = totalValidations > 0 ? 
      this.validationHistory.reduce((sum, v) => sum + v.score, 0) / totalValidations : 0;

    const errorsByCategory: Record<string, number> = {};
    const warningsByCategory: Record<string, number> = {};

    this.validationHistory.forEach(validation => {
      validation.errors.forEach(error => {
        const rule = this.validationRules.find(r => r.id === error.code);
        if (rule) {
          errorsByCategory[rule.category] = (errorsByCategory[rule.category] || 0) + 1;
        }
      });

      validation.warnings.forEach(warning => {
        const rule = this.validationRules.find(r => r.id === warning.code);
        if (rule) {
          warningsByCategory[rule.category] = (warningsByCategory[rule.category] || 0) + 1;
        }
      });
    });

    const stats: ValidationStats = {
      totalValidations,
      successRate: Math.round(successRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      errorsByCategory,
      warningsByCategory,
      lastValidation: totalValidations > 0 ? this.validationHistory[totalValidations - 1].timestamp : null
    };

    this.statsSubject.next(stats);
  }

  /**
   * Effacer l'historique des validations
   */
  clearHistory(): void {
    this.validationHistory = [];
    this.updateStats();
    console.log('Historique des validations effacé');
  }

  /**
   * Exporter les données de validation
   */
  exportValidationData(): string {
    const data = {
      rules: this.validationRules,
      history: this.validationHistory,
      stats: this.getStats(),
      exportDate: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importer les données de validation
   */
  importValidationData(dataJson: string): boolean {
    try {
      const data = JSON.parse(dataJson);
      
      if (data.rules) {
        this.validationRules = data.rules;
      }
      
      if (data.history) {
        this.validationHistory = data.history;
      }
      
      this.updateStats();
      console.log('Données de validation importées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des données de validation:', error);
      return false;
    }
  }
}


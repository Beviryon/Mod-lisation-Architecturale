import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculateurFenetresService, MurConfig, CalculFenetres } from '../../../services/calculateur-fenetres/calculateur-fenetres.service';

/**
 * Interface pour les paramètres de fenêtres
 */
export interface FenetresParams {
  tailleFenetre: string;
  ecart: number;
  nombreFenetres: number;
  couleur: string;
}

/**
 * Composant pour le calculateur de fenêtres
 */
@Component({
  selector: 'app-fenetres-calculator',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fenetres-calculator" *ngIf="isVisible">
      <h3>🧮 Calculateur de Fenêtres</h3>
      
      <!-- Sélection du mur -->
      <div class="mur-selection">
        <label for="murSelect">Mur à modifier :</label>
        <select 
          id="murSelect"
          [(ngModel)]="selectedMurId" 
          (change)="onMurChange()"
          class="mur-select"
        >
          <option value="">-- Sélectionner un mur --</option>
          <option 
            *ngFor="let mur of mursDisponibles" 
            [value]="mur.id"
          >
            {{ mur.nom }} ({{ mur.dimensions.width }}m × {{ mur.dimensions.height }}m)
          </option>
        </select>
      </div>

      <!-- Informations du mur sélectionné -->
      <div class="mur-info" *ngIf="murSelectionne">
        <h4>📐 Informations du Mur</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Largeur :</span>
            <span class="value">{{ murSelectionne.dimensions.width }}m</span>
          </div>
          <div class="info-item">
            <span class="label">Hauteur :</span>
            <span class="value">{{ murSelectionne.dimensions.height }}m</span>
          </div>
          <div class="info-item">
            <span class="label">Profondeur :</span>
            <span class="value">{{ murSelectionne.dimensions.depth }}m</span>
          </div>
        </div>
      </div>

      <!-- Paramètres des fenêtres -->
      <div class="fenetres-params" *ngIf="murSelectionne">
        <h4>🪟 Paramètres des Fenêtres</h4>
        
        <!-- Taille des fenêtres -->
        <div class="param-group">
          <label for="tailleSelect">Taille des fenêtres :</label>
          <select 
            id="tailleSelect"
            [(ngModel)]="parametresFenetres.tailleFenetre" 
            (change)="calculerFenetres()"
            class="param-select"
          >
            <option value="petit">Petit (0.8m × 1.0m)</option>
            <option value="moyen">Moyen (1.2m × 1.5m)</option>
            <option value="grand">Grand (1.8m × 2.0m)</option>
          </select>
        </div>

        <!-- Écart entre fenêtres -->
        <div class="param-group">
          <label for="ecartInput">Écart entre fenêtres (m) :</label>
          <input 
            type="range" 
            id="ecartInput"
            min="0.2" 
            max="2.0" 
            step="0.1" 
            [(ngModel)]="parametresFenetres.ecart"
            (input)="calculerFenetres()"
            class="param-slider"
          >
          <span class="slider-value">{{ parametresFenetres.ecart }}m</span>
        </div>

        <!-- Nombre de fenêtres -->
        <div class="param-group">
          <label for="nombreInput">Nombre de fenêtres :</label>
          <input 
            type="range" 
            id="nombreInput"
            [min]="1" 
            [max]="calculResultat?.nombreMaxFenetres || 5" 
            step="1" 
            [(ngModel)]="parametresFenetres.nombreFenetres"
            (input)="calculerFenetres()"
            class="param-slider"
          >
          <span class="slider-value">{{ parametresFenetres.nombreFenetres }}</span>
        </div>

        <!-- Couleur des fenêtres -->
        <div class="param-group">
          <label for="couleurInput">Couleur des fenêtres :</label>
          <input 
            type="color" 
            id="couleurInput"
            [(ngModel)]="parametresFenetres.couleur"
            class="param-color"
          >
        </div>
      </div>

      <!-- Résultats du calcul -->
      <div class="calcul-results" *ngIf="calculResultat">
        <h4>📊 Résultats du Calcul</h4>
        
        <div class="result-item" [class.valid]="calculResultat.isValid" [class.invalid]="!calculResultat.isValid">
          <div class="result-icon">
            {{ calculResultat.isValid ? '✅' : '⚠️' }}
          </div>
          <div class="result-content">
            <div class="result-message">{{ calculResultat.message }}</div>
            <div class="result-details" *ngIf="calculResultat.isValid">
              <div class="detail-item">
                <span class="label">Largeur fenêtre :</span>
                <span class="value">{{ calculResultat.largeurFenetreOptimale }}m</span>
              </div>
              <div class="detail-item">
                <span class="label">Écart optimal :</span>
                <span class="value">{{ calculResultat.ecartOptimal }}m</span>
              </div>
              <div class="detail-item">
                <span class="label">Largeur totale utilisée :</span>
                <span class="value">{{ calculResultat.largeurTotaleUtilisee }}m</span>
              </div>
              <div class="detail-item">
                <span class="label">Marge restante :</span>
                <span class="value">{{ calculResultat.margeRestante }}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="action-buttons" *ngIf="murSelectionne">
        <button 
          type="button" 
          (click)="appliquerConfiguration()" 
          class="btn btn-primary"
          [disabled]="!calculResultat?.isValid"
          title="Appliquer la configuration des fenêtres"
        >
          ✅ Appliquer Configuration
        </button>
        
        <button 
          type="button" 
          (click)="reinitialiserParametres()" 
          class="btn btn-secondary"
          title="Réinitialiser les paramètres"
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  `,
  styles: [`
    .fenetres-calculator {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 10px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .fenetres-calculator h3 {
      margin: 0 0 15px 0;
      color: #495057;
      font-size: 1.1em;
      font-weight: 600;
    }

    .mur-selection {
      margin-bottom: 20px;
    }

    .mur-selection label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #495057;
    }

    .mur-select, .param-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background: white;
      font-size: 0.9em;
    }

    .mur-info {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .mur-info h4 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 1em;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }

    .label {
      font-weight: 500;
      color: #6c757d;
    }

    .value {
      font-weight: 600;
      color: #495057;
    }

    .fenetres-params {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .fenetres-params h4 {
      margin: 0 0 15px 0;
      color: #495057;
      font-size: 1em;
    }

    .param-group {
      margin-bottom: 15px;
    }

    .param-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #495057;
    }

    .param-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      -webkit-appearance: none;
    }

    .param-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .slider-value {
      display: inline-block;
      margin-left: 10px;
      font-weight: 600;
      color: #007bff;
    }

    .param-color {
      width: 100%;
      height: 40px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      cursor: pointer;
    }

    .calcul-results {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .calcul-results h4 {
      margin: 0 0 15px 0;
      color: #495057;
      font-size: 1em;
    }

    .result-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .result-item.valid {
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .result-item.invalid {
      background: #f8d7da;
      border-color: #f5c6cb;
    }

    .result-icon {
      font-size: 1.2em;
    }

    .result-content {
      flex: 1;
    }

    .result-message {
      font-weight: 500;
      margin-bottom: 10px;
    }

    .result-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9em;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }
  `],
  standalone: true
})
export class FenetresCalculatorComponent {
  @Input() isVisible: boolean = false;
  @Input() mursDisponibles: Array<{ id: string; nom: string; dimensions: { width: number; height: number; depth: number } }> = [];
  @Input() selectedMurId: string = '';
  @Input() parametresFenetres: FenetresParams = {
    tailleFenetre: 'moyen',
    ecart: 0.5,
    nombreFenetres: 2,
    couleur: '#87CEEB'
  };

  @Output() murSelected = new EventEmitter<string>();
  @Output() configurationApplied = new EventEmitter<{ murId: string; parametres: FenetresParams; calcul: CalculFenetres }>();
  @Output() parametresReset = new EventEmitter<void>();

  calculResultat: CalculFenetres | null = null;

  taillesFenetres: { [key: string]: { largeur: number; hauteur: number; nom: string } } = {
    petit: { largeur: 0.8, hauteur: 1.0, nom: 'Petit' },
    moyen: { largeur: 1.2, hauteur: 1.5, nom: 'Moyen' },
    grand: { largeur: 1.8, hauteur: 2.0, nom: 'Grand' }
  };
  murSelectionne: { id: string; nom: string; dimensions: { width: number; height: number; depth: number } } | null = null;

  constructor(private calculateurFenetresService: CalculateurFenetresService) {}

  onMurChange(): void {
    this.murSelectionne = this.mursDisponibles.find(m => m.id === this.selectedMurId) || null;
    if (this.murSelectionne) {
      this.calculerFenetres();
    }
    this.murSelected.emit(this.selectedMurId);
  }

  calculerFenetres(): void {
    if (!this.murSelectionne) return;

    const murConfig: MurConfig = {
      position: { x: 0, y: 0, z: 0 },
      dimensions: this.murSelectionne.dimensions,
      color: 0xaaaaaa
    };

    // Récupérer les dimensions de la taille de fenêtre sélectionnée
    const taille = this.taillesFenetres[this.parametresFenetres.tailleFenetre];
    
    this.calculResultat = this.calculateurFenetresService.calculerNombreMaxFenetres(
      murConfig,
      taille.largeur,
      this.parametresFenetres.ecart,
      taille.hauteur
    );
  }

  appliquerConfiguration(): void {
    if (this.murSelectionne && this.calculResultat?.isValid) {
      this.configurationApplied.emit({
        murId: this.murSelectionne.id,
        parametres: { ...this.parametresFenetres },
        calcul: this.calculResultat
      });
    }
  }

  reinitialiserParametres(): void {
    this.parametresFenetres = {
      tailleFenetre: 'moyen',
      ecart: 0.5,
      nombreFenetres: 2,
      couleur: '#87CEEB'
    };
    this.calculResultat = null;
    this.parametresReset.emit();
  }
}

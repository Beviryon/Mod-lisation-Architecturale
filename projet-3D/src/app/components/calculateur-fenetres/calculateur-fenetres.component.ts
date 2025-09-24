import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculateurFenetresService, CalculFenetres, MurConfig } from '../../services/calculateur-fenetres/calculateur-fenetres.service';
import { BUILDING_CONFIG } from '../../config/building-config';

@Component({
  selector: 'app-calculateur-fenetres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculateur-container">
      <h2>Calculateur de Fenêtres Intelligent</h2>
      
      <!-- Sélection du mur -->
      <div class="section">
        <h3>Sélection du Mur</h3>
        <select [(ngModel)]="murSelectionne" (change)="onMurChange()" class="form-control">
          <option value="">-- Choisir un mur --</option>
          <option value="principal">Mur Principal (Façade)</option>
          <option value="arriere">Mur Arrière</option>
          <option value="gauche">Mur Gauche</option>
          <option value="droit">Mur Droit</option>
        </select>
      </div>

      <!-- Informations du mur -->
      <div class="section" *ngIf="murSelectionne && murInfo">
        <h3> Informations du Mur</h3>
        <div class="mur-info">
          <p><strong>Largeur:</strong> {{ murInfo.dimensions.width }}m</p>
          <p><strong>Hauteur:</strong> {{ murInfo.dimensions.height }}m</p>
          <p><strong>Profondeur:</strong> {{ murInfo.dimensions.depth }}m</p>
          <p><strong>Position:</strong> ({{ murInfo.position.x }}, {{ murInfo.position.y }}, {{ murInfo.position.z }})</p>
        </div>
      </div>

      <!-- Paramètres des fenêtres -->
      <div class="section" *ngIf="murSelectionne">
        <h3>Paramètres des Fenêtres</h3>
        
        <div class="parametres">
          <div class="parametre">
            <label>Largeur des fenêtres (m):</label>
            <input 
              type="range" 
              [(ngModel)]="largeurFenetre" 
              [min]="0.5" 
              [max]="3.0" 
              [step]="0.1"
              (input)="calculerCapacite()"
              class="slider">
            <span class="valeur">{{ largeurFenetre }}m</span>
          </div>

          <div class="parametre">
            <label>Hauteur des fenêtres (m):</label>
            <input 
              type="range" 
              [(ngModel)]="hauteurFenetre" 
              [min]="0.8" 
              [max]="2.5" 
              [step]="0.1"
              (input)="calculerCapacite()"
              class="slider">
            <span class="valeur">{{ hauteurFenetre }}m</span>
          </div>

          <div class="parametre">
            <label>Écart entre fenêtres (m):</label>
            <input 
              type="range" 
              [(ngModel)]="ecart" 
              [min]="0.1" 
              [max]="2.0" 
              [step]="0.1"
              (input)="calculerCapacite()"
              class="slider">
            <span class="valeur">{{ ecart }}m</span>
          </div>

          <div class="parametre">
            <label>Nombre de fenêtres souhaitées:</label>
            <input 
              type="number" 
              [(ngModel)]="nombreFenetresSouhaitees" 
              [min]="0" 
              [max]="20"
              (input)="calculerCapacite()"
              class="number-input">
          </div>
        </div>
      </div>

      <!-- Résultats du calcul -->
      <div class="section" *ngIf="calculResultat">
        <h3>Résultats du Calcul</h3>
        
        <div class="resultats" [class.valid]="calculResultat.isValid" [class.invalid]="!calculResultat.isValid">
          <div class="statut">
            <span class="icone">{{ calculResultat.isValid ? '✅' : '❌' }}</span>
            <span class="message">{{ calculResultat.message }}</span>
          </div>
          
          <div class="details" *ngIf="calculResultat.isValid">
            <div class="detail">
              <strong>Nombre max de fenêtres:</strong> {{ calculResultat.nombreMaxFenetres }}
            </div>
            <div class="detail">
              <strong>Largeur totale utilisée:</strong> {{ calculResultat.largeurTotaleUtilisee.toFixed(2) }}m
            </div>
            <div class="detail">
              <strong>Marge restante:</strong> {{ calculResultat.margeRestante.toFixed(2) }}m
            </div>
            <div class="detail">
              <strong>Écart optimal:</strong> {{ calculResultat.ecartOptimal.toFixed(2) }}m
            </div>
          </div>
        </div>

        <!-- Positions calculées -->
        <div class="positions" *ngIf="calculResultat.positionsCalculees.length > 0">
          <h4>Positions Calculées</h4>
          <div class="position-list">
            <div 
              *ngFor="let position of calculResultat.positionsCalculees; let i = index" 
              class="position-item">
              <span class="numero">Fenêtre {{ i + 1 }}:</span>
              <span class="coordonnees">
                X: {{ position.x.toFixed(2) }}m, 
                Y: {{ position.y.toFixed(2) }}m, 
                Z: {{ position.z.toFixed(2) }}m
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="actions" *ngIf="calculResultat && calculResultat.isValid">
        <button 
          (click)="genererConfiguration()" 
          class="btn btn-primary"
          [disabled]="nombreFenetresSouhaitees > calculResultat.nombreMaxFenetres">
          Générer la Configuration
        </button>
        
        <button 
          (click)="optimiserDimensions()" 
          class="btn btn-secondary">
          Optimiser les Dimensions
        </button>
      </div>

      <!-- Configuration générée -->
      <div class="section" *ngIf="configurationGeneree">
        <h3>Configuration Générée</h3>
        <div class="config-code">
          <pre>{{ configurationGeneree }}</pre>
        </div>
        <button (click)="copierConfiguration()" class="btn btn-success">Copier la Configuration</button>
      </div>
    </div>
  `,
  styles: [`
    .calculateur-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #007bff;
    }

    .section h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    .mur-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .mur-info p {
      background: white;
      padding: 10px;
      border-radius: 5px;
      margin: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .parametres {
      display: grid;
      gap: 20px;
      margin-top: 15px;
    }

    .parametre {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .parametre label {
      min-width: 200px;
      font-weight: 500;
    }

    .slider {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
    }

    .valeur {
      min-width: 60px;
      font-weight: bold;
      color: #007bff;
    }

    .number-input {
      width: 100px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .resultats {
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }

    .resultats.valid {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .resultats.invalid {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .statut {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .icone {
      font-size: 1.2em;
    }

    .message {
      font-weight: 500;
    }

    .details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
    }

    .detail {
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .positions {
      margin-top: 20px;
    }

    .position-list {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }

    .position-item {
      background: white;
      padding: 12px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .numero {
      font-weight: bold;
      color: #007bff;
    }

    .coordonnees {
      font-family: 'Courier New', monospace;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
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

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #1e7e34;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .config-code {
      background: #2d3748;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
      overflow-x: auto;
    }

    .config-code pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
  `]
})
export class CalculateurFenetresComponent implements OnInit {
  
  murSelectionne: string = '';
  murInfo: MurConfig | null = null;
  
  // Paramètres des fenêtres
  largeurFenetre: number = 1.5;
  hauteurFenetre: number = 1.2;
  ecart: number = 0.5;
  nombreFenetresSouhaitees: number = 2;
  
  // Résultats
  calculResultat: CalculFenetres | null = null;
  configurationGeneree: string = '';

  constructor(private calculateurService: CalculateurFenetresService) {}

  ngOnInit() {
    console.log('CalculateurFenetresComponent initialisé');
  }

  onMurChange() {
    if (!this.murSelectionne) {
      this.murInfo = null;
      this.calculResultat = null;
      return;
    }

    // Récupérer les informations du mur depuis BUILDING_CONFIG
    this.murInfo = this.getMurFromConfig(this.murSelectionne);

    if (this.murInfo) {
      this.calculerCapacite();
    }
  }

  private getMurFromConfig(nomMur: string): MurConfig | null {
    const config = BUILDING_CONFIG;
    switch (nomMur) {
      case 'principal':
        return {
          position: config.mainWall.position,
          dimensions: {
            width: config.mainWall.contour[1].x - config.mainWall.contour[0].x,
            height: config.mainWall.contour[2].y - config.mainWall.contour[0].y,
            depth: config.mainWall.thickness
          },
          color: config.mainWall.color
        };
        
      case 'arriere':
        return {
          position: config.walls.back.position,
          dimensions: config.walls.back.dimensions,
          color: config.walls.back.color
        };
      
      case 'gauche':
        return {
          position: config.walls.left.position,
          dimensions: config.walls.left.dimensions,
          color: config.walls.left.color
        };
      
      case 'droit':
        return {
          position: config.walls.right.position,
          dimensions: config.walls.right.dimensions,
          color: config.walls.right.color
        };
      
      default:
        return null;
    }
  }

  calculerCapacite() {
    if (!this.murInfo) return;

    this.calculResultat = this.calculateurService.calculerNombreMaxFenetres(
      this.murInfo,
      this.largeurFenetre,
      this.ecart,
      this.hauteurFenetre
    );
  }

  genererConfiguration() {
    if (!this.murInfo || !this.calculResultat) return;

    const resultat = this.calculateurService.genererConfigurationFenetres(
      this.murInfo,
      this.nombreFenetresSouhaitees,
      this.largeurFenetre,
      this.ecart,
      this.hauteurFenetre,
      0xff0000
    );

    if (resultat.isValid) {
      this.configurationGeneree = this.formaterConfiguration(resultat.fenetres);
    } else {
      alert(resultat.message);
    }
  }

  optimiserDimensions() {
    if (!this.murInfo) return;

    const optimisation = this.calculateurService.optimiserDimensions(
      this.murInfo,
      this.nombreFenetresSouhaitees,
      this.hauteurFenetre
    );

    if (optimisation.isValid) {
      this.largeurFenetre = optimisation.largeurFenetre;
      this.ecart = optimisation.ecart;
      this.calculerCapacite();
      alert(optimisation.message);
    } else {
      alert(optimisation.message);
    }
  }

  private formaterConfiguration(fenetres: any[]): string {
    let config = 'openings: {\n';
    
    fenetres.forEach((fenetre, index) => {
      config += `  window${index + 1}: {\n`;
      config += `    position: { x: ${fenetre.position.x.toFixed(2)}, y: ${fenetre.position.y.toFixed(2)}, z: ${fenetre.position.z.toFixed(2)} },\n`;
      config += `    dimensions: { width: ${fenetre.dimensions.width}, height: ${fenetre.dimensions.height}, depth: ${fenetre.dimensions.depth} },\n`;
      config += `    color: 0x${fenetre.color.toString(16)},\n`;
      config += `    type: 'window' as const\n`;
      config += `  }${index < fenetres.length - 1 ? ',' : ''}\n`;
    });
    
    config += '}';
    return config;
  }

  copierConfiguration() {
    navigator.clipboard.writeText(this.configurationGeneree).then(() => {
      alert('Configuration copiée dans le presse-papiers !');
    });
  }
}

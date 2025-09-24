import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface pour la structure du bâtiment
 */
export interface Structure {
  nom: string;
  description: string;
  type: string;
  dimensions: {
    longueur: number;
    largeur: number;
    hauteur: number;
  };
  couleur: string;
  materiau: string;
  materiauPrincipal: string;
  materiauToit: string;
}

/**
 * Composant pour contrôler la structure globale du bâtiment
 */
@Component({
  selector: 'app-structure-controller',
  imports: [CommonModule, FormsModule],
  templateUrl: './structure-controller.component.html',
  styleUrl: './structure-controller.component.css',
  standalone: true
})
export class StructureControllerComponent {
  @Input() isVisible: boolean = false;
  @Input() structure: Structure = {
    nom: 'Bâtiment Principal',
    description: 'Bâtiment architectural avec murs, ouvertures et toit',
    type: 'residentiel',
    dimensions: { longueur: 8, largeur: 5, hauteur: 2.5 },
    couleur: '#aaaaaa',
    materiau: 'beton',
    materiauPrincipal: 'beton',
    materiauToit: 'tuile'
  };

  @Output() structureChanged = new EventEmitter<Structure>();
  @Output() structureApplied = new EventEmitter<Structure>();
  @Output() structureReset = new EventEmitter<void>();
  @Output() structureOptimized = new EventEmitter<Structure>();
  @Output() structureExported = new EventEmitter<Structure>();
  @Output() structureImported = new EventEmitter<Structure>();
  @Output() structurePreviewed = new EventEmitter<Structure>();

  onStructureChange(): void {
    this.structureChanged.emit({ ...this.structure });
  }

  applyStructure(): void {
    this.structureApplied.emit({ ...this.structure });
  }

  resetToDefault(): void {
    this.structure = {
      nom: 'Bâtiment Principal',
      description: 'Bâtiment architectural avec murs, ouvertures et toit',
      type: 'residentiel',
      dimensions: { longueur: 8, largeur: 5, hauteur: 2.5 },
      couleur: '#aaaaaa',
      materiau: 'beton',
      materiauPrincipal: 'beton',
      materiauToit: 'tuile'
    };
    this.structureReset.emit();
  }

  optimizeDimensions(): void {
    // Optimisation basique des dimensions
    const optimizedStructure = { ...this.structure };
    
    // Ratio optimal pour un bâtiment résidentiel
    const ratioOptimal = 0.4; // hauteur/longueur
    const longueurOptimale = Math.sqrt(this.getVolume() / ratioOptimal);
    
    optimizedStructure.dimensions.longueur = Math.round(longueurOptimale * 10) / 10;
    optimizedStructure.dimensions.largeur = Math.round(longueurOptimale * 0.6 * 10) / 10;
    optimizedStructure.dimensions.hauteur = Math.round(longueurOptimale * ratioOptimal * 10) / 10;
    
    this.structure = optimizedStructure;
    this.structureOptimized.emit(optimizedStructure);
  }

  exportStructure(): void {
    this.structureExported.emit({ ...this.structure });
  }

  importStructure(): void {
    // Simulation d'importation
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const importedStructure = JSON.parse(e.target.result);
            this.structure = { ...this.structure, ...importedStructure };
            this.structureImported.emit(this.structure);
          } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  previewStructure(): void {
    this.structurePreviewed.emit({ ...this.structure });
  }

  // Méthodes de calcul
  getSurfaceSol(): number {
    return Math.round(this.structure.dimensions.longueur * this.structure.dimensions.largeur * 10) / 10;
  }

  getVolume(): number {
    return Math.round(this.structure.dimensions.longueur * this.structure.dimensions.largeur * this.structure.dimensions.hauteur * 10) / 10;
  }

  getPerimetre(): number {
    return Math.round((this.structure.dimensions.longueur + this.structure.dimensions.largeur) * 2 * 10) / 10;
  }

  getRatioHauteurLongueur(): number {
    return Math.round((this.structure.dimensions.hauteur / this.structure.dimensions.longueur) * 100) / 100;
  }

  getVolumeTotal(): number {
    return this.getVolume();
  }

  getNombreMurs(): number {
    // Cette méthode devrait recevoir les murs en input ou via un service
    return 0; // Valeur par défaut
  }

  getNombreOuvertures(): number {
    // Cette méthode devrait recevoir les ouvertures en input ou via un service
    return 0; // Valeur par défaut
  }

  resetStructure(): void {
    this.resetToDefault();
  }
}

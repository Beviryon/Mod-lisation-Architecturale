import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface pour les dimensions d'un élément
 */
export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

/**
 * Interface pour les dimensions de structure
 */
export interface StructureDimensions {
  longueur: number;
  largeur: number;
  hauteur: number;
}

/**
 * Composant pour contrôler les dimensions en temps réel
 */
@Component({
  selector: 'app-dimensions-controller',
  imports: [CommonModule, FormsModule],
  templateUrl: './dimensions-controller.component.html',
  styleUrl: './dimensions-controller.component.css',
  standalone: true
})
export class DimensionsControllerComponent {
  @Input() isVisible: boolean = false;
  @Input() showStructureDimensions: boolean = true;
  @Input() showElementDimensions: boolean = false;
  @Input() elementName: string = 'Élément';
  @Input() structureDimensions: StructureDimensions = { longueur: 8, largeur: 5, hauteur: 2.5 };
  @Input() elementDimensions: Dimensions = { width: 1, height: 2, depth: 0.1 };
  @Input() minDimensions: Dimensions = { width: 0.5, height: 1, depth: 0.01 };
  @Input() maxDimensions: Dimensions = { width: 5, height: 4, depth: 1 };

  @Output() structureDimensionsChange = new EventEmitter<StructureDimensions>();
  @Output() elementDimensionsChange = new EventEmitter<Dimensions>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() applyRequested = new EventEmitter<void>();

  onStructureDimensionsChange(): void {
    this.structureDimensionsChange.emit({ ...this.structureDimensions });
  }

  onElementDimensionsChange(): void {
    this.elementDimensionsChange.emit({ ...this.elementDimensions });
  }

  resetDimensions(): void {
    this.structureDimensions = { longueur: 8, largeur: 5, hauteur: 2.5 };
    this.elementDimensions = { width: 1, height: 2, depth: 0.1 };
    this.resetRequested.emit();
  }

  applyDimensions(): void {
    this.applyRequested.emit();
  }
}

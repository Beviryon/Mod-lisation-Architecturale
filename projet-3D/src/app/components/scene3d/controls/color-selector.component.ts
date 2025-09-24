import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface pour un élément colorable
 */
export interface ColorableElement {
  id: string;
  name: string;
  currentColor: string;
  type: 'mur' | 'ouverture' | 'toit' | 'sol' | 'structure';
}

/**
 * Composant pour sélectionner et modifier les couleurs des éléments
 */
@Component({
  selector: 'app-color-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.css',
  standalone: true
})
export class ColorSelectorComponent {
  @Input() isVisible: boolean = false;
  @Input() elements: ColorableElement[] = [];
  @Input() selectedElementId: string = '';
  @Input() newColor: string = '#007bff';

  @Output() elementSelected = new EventEmitter<string>();
  @Output() colorChanged = new EventEmitter<{ elementId: string; color: string }>();
  @Output() colorApplied = new EventEmitter<{ elementId: string; color: string }>();
  @Output() colorReset = new EventEmitter<string>();

  // Couleurs prédéfinies
  presetColors = [
    { name: 'Rouge', value: '#dc3545' },
    { name: 'Vert', value: '#28a745' },
    { name: 'Bleu', value: '#007bff' },
    { name: 'Jaune', value: '#ffc107' },
    { name: 'Orange', value: '#fd7e14' },
    { name: 'Violet', value: '#6f42c1' },
    { name: 'Rose', value: '#e83e8c' },
    { name: 'Cyan', value: '#17a2b8' },
    { name: 'Gris', value: '#6c757d' },
    { name: 'Blanc', value: '#ffffff' },
    { name: 'Noir', value: '#000000' },
    { name: 'Marron', value: '#8b4513' }
  ];

  get selectedElement(): ColorableElement | null {
    return this.elements.find(e => e.id === this.selectedElementId) || null;
  }

  onElementChange(): void {
    if (this.selectedElement) {
      this.newColor = this.selectedElement.currentColor;
    }
    this.elementSelected.emit(this.selectedElementId);
  }

  onColorChange(): void {
    if (this.selectedElementId) {
      this.colorChanged.emit({ elementId: this.selectedElementId, color: this.newColor });
    }
  }

  selectPresetColor(color: string): void {
    this.newColor = color;
    this.onColorChange();
  }

  applyColor(): void {
    if (this.selectedElementId && this.newColor) {
      this.colorApplied.emit({ elementId: this.selectedElementId, color: this.newColor });
    }
  }

  resetColor(): void {
    if (this.selectedElementId) {
      this.colorReset.emit(this.selectedElementId);
    }
  }

  selectElement(elementId: string): void {
    this.selectedElementId = elementId;
    this.onElementChange();
  }
}

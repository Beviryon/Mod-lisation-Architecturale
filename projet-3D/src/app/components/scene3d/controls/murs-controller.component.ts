import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface pour un mur
 */
export interface Mur {
  id: string;
  nom: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: string;
  epaisseur: number;
  ouvertures: Array<{
    id: string;
    type: 'porte' | 'fenetre';
    position: { x: number; y: number; z: number };
    dimensions: { width: number; height: number; depth: number };
    couleur: string;
  }>;
}

/**
 * Composant pour contrôler les murs
 */
@Component({
  selector: 'app-murs-controller',
  imports: [CommonModule, FormsModule],
  templateUrl: './murs-controller.component.html',
  styleUrl: './murs-controller.component.css',
  standalone: true
})
export class MursControllerComponent {
  @Input() isVisible: boolean = false;
  @Input() murs: Mur[] = [];
  @Input() selectedMurId: string = '';

  @Output() murSelected = new EventEmitter<string>();
  @Output() murChanged = new EventEmitter<Mur>();
  @Output() ouvertureAdded = new EventEmitter<{ murId: string; ouverture: any }>();
  @Output() ouvertureRemoved = new EventEmitter<{ murId: string; index: number }>();
  @Output() murDuplicated = new EventEmitter<Mur>();
  @Output() murDeleted = new EventEmitter<string>();

  get murSelectionne(): Mur | null {
    return this.murs.find(m => m.id === this.selectedMurId) || null;
  }

  selectMur(murId: string): void {
    this.selectedMurId = murId;
    this.murSelected.emit(murId);
  }

  onMurChange(): void {
    if (this.murSelectionne) {
      this.murChanged.emit({ ...this.murSelectionne });
    }
  }

  addOuverture(): void {
    if (this.murSelectionne) {
      const nouvelleOuverture = {
        id: `ouverture_${Date.now()}`,
        type: 'fenetre' as const,
        position: { x: 0, y: 1, z: 0 },
        dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
        couleur: '#87CEEB'
      };
      this.ouvertureAdded.emit({ murId: this.murSelectionne.id, ouverture: nouvelleOuverture });
    }
  }

  removeOuverture(index: number): void {
    if (this.murSelectionne) {
      this.ouvertureRemoved.emit({ murId: this.murSelectionne.id, index });
    }
  }

  duplicateMur(): void {
    if (this.murSelectionne) {
      this.murDuplicated.emit({ ...this.murSelectionne });
    }
  }

  deleteMur(): void {
    if (this.murSelectionne) {
      this.murDeleted.emit(this.murSelectionne.id);
    }
  }
}

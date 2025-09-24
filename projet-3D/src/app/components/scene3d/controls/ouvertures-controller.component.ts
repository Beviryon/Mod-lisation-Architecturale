import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface pour une ouverture
 */
export interface Ouverture {
  id: string;
  nom: string;
  type: 'porte' | 'fenetre';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  couleur: string;
  murParent: string;
}

/**
 * Composant pour contrôler les ouvertures
 */
@Component({
  selector: 'app-ouvertures-controller',
  imports: [CommonModule, FormsModule],
  templateUrl: './ouvertures-controller.component.html',
  styleUrl: './ouvertures-controller.component.css',
  standalone: true
})
export class OuverturesControllerComponent {
  @Input() isVisible: boolean = false;
  @Input() ouvertures: Ouverture[] = [];
  @Input() mursDisponibles: Array<{ id: string; nom: string }> = [];
  @Input() selectedOuvertureId: string = '';

  @Output() ouvertureSelected = new EventEmitter<string>();
  @Output() ouvertureChanged = new EventEmitter<Ouverture>();
  @Output() ouvertureAdded = new EventEmitter<Ouverture>();
  @Output() ouvertureDuplicated = new EventEmitter<Ouverture>();
  @Output() ouvertureDeleted = new EventEmitter<string>();

  typeFilter: string = '';
  murFilter: string = '';
  ouverturesFiltrees: Ouverture[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  get ouvertureSelectionnee(): Ouverture | null {
    return this.ouvertures.find(o => o.id === this.selectedOuvertureId) || null;
  }

  applyFilters(): void {
    this.ouverturesFiltrees = this.ouvertures.filter(ouverture => {
      const typeMatch = !this.typeFilter || ouverture.type === this.typeFilter;
      const murMatch = !this.murFilter || ouverture.murParent === this.murFilter;
      return typeMatch && murMatch;
    });
  }

  selectOuverture(ouvertureId: string): void {
    this.selectedOuvertureId = ouvertureId;
    this.ouvertureSelected.emit(ouvertureId);
  }

  onOuvertureChange(): void {
    if (this.ouvertureSelectionnee) {
      this.ouvertureChanged.emit({ ...this.ouvertureSelectionnee });
    }
  }

  addOuverture(): void {
    const nouvelleOuverture: Ouverture = {
      id: `ouverture_${Date.now()}`,
      nom: 'Nouvelle ouverture',
      type: 'fenetre',
      position: { x: 0, y: 1, z: 0 },
      dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
      couleur: '#87CEEB',
      murParent: this.mursDisponibles[0]?.id || ''
    };
    this.ouvertureAdded.emit(nouvelleOuverture);
  }

  duplicateOuverture(): void {
    if (this.ouvertureSelectionnee) {
      const ouvertureDupliquee: Ouverture = {
        ...this.ouvertureSelectionnee,
        id: `ouverture_${Date.now()}`,
        nom: `${this.ouvertureSelectionnee.nom} (copie)`
      };
      this.ouvertureDuplicated.emit(ouvertureDupliquee);
    }
  }

  deleteOuverture(): void {
    if (this.ouvertureSelectionnee) {
      this.ouvertureDeleted.emit(this.ouvertureSelectionnee.id);
    }
  }

  getMurName(murId: string): string {
    const mur = this.mursDisponibles.find(m => m.id === murId);
    return mur ? mur.nom : 'Mur inconnu';
  }
}

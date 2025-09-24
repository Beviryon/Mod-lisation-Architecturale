import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { BUILDING_CONFIG, WallCalculations } from '../../config/building-config';

// Import des sous-composants
import { Scene3dCoreComponent } from './core/scene3d-core.component';
import { DimensionsControllerComponent } from './controls/dimensions-controller.component';
import { ColorSelectorComponent } from './controls/color-selector.component';
import { FenetresCalculatorComponent } from './calculators/fenetres-calculator.component';
import { MursControllerComponent } from './controls/murs-controller.component';
import { OuverturesControllerComponent } from './controls/ouvertures-controller.component';
import { StructureControllerComponent } from './controls/structure-controller.component';

// Import des services
import { ConfigurationService } from '../../services/configuration/configuration.service';
import { BatimentService } from '../../services/batiment/batiment.service';
import { MurService } from '../../services/mur/mur.service';
import { OuvertureService } from '../../services/ouverture/ouverture.service';
import { MateriauService } from '../../services/materiau/materiau.service';
import { SceneService } from '../../services/scene/scene.service';
import { CalculateurFenetresService, MurConfig, CalculFenetres } from '../../services/calculateur-fenetres/calculateur-fenetres.service';

/**
 * Composant principal Scene3d refactorisé
 * Utilise des sous-composants pour une meilleure organisation
 */
@Component({
  selector: 'app-scene3d',
  imports: [
    CommonModule, 
    FormsModule,
    Scene3dCoreComponent,
    DimensionsControllerComponent,
    ColorSelectorComponent,
    FenetresCalculatorComponent,
    MursControllerComponent,
    OuverturesControllerComponent,
    StructureControllerComponent
  ],
  templateUrl: './scene3d-refactored.html',
  styleUrl: './scene3d.css',
  standalone: true
})
export class Scene3dRefactored implements OnInit, OnDestroy {
  @ViewChild(Scene3dCoreComponent) scene3dCore!: Scene3dCoreComponent;

  // État des interfaces
  showDimensionsInterface = false;
  showColorSelector = false;
  showFenetresCalculator = false;
  showMursController = false;
  showOuverturesController = false;
  showStructureController = false;
  showLegendModal = false;
  showTestModal = false;

  // Données pour les sous-composants
  structureDimensions = {
    longueur: 8,
    largeur: 5,
    hauteur: 2.5
  };

  elementDimensions = {
    width: 1,
    height: 2,
    depth: 0.1
  };

  minDimensions = {
    width: 0.5,
    height: 1,
    depth: 0.01
  };

  maxDimensions = {
    width: 5,
    height: 4,
    depth: 1
  };

  // Données pour le sélecteur de couleurs
  colorableElements = [
    { id: 'mur_principal', name: 'Mur Principal', currentColor: '#aaaaaa', type: 'mur' as const },
    { id: 'mur_arriere', name: 'Mur Arrière', currentColor: '#aaaaaa', type: 'mur' as const },
    { id: 'mur_gauche', name: 'Mur Gauche', currentColor: '#aaaaaa', type: 'mur' as const },
    { id: 'mur_droit', name: 'Mur Droit', currentColor: '#aaaaaa', type: 'mur' as const },
    { id: 'porte', name: 'Porte', currentColor: '#00ff00', type: 'ouverture' as const },
    { id: 'fenetre1', name: 'Fenêtre 1', currentColor: '#ff0000', type: 'ouverture' as const },
    { id: 'fenetre2', name: 'Fenêtre 2', currentColor: '#ff0000', type: 'ouverture' as const },
    { id: 'toit', name: 'Toit', currentColor: '#0000ff', type: 'toit' as const },
    { id: 'sol', name: 'Sol', currentColor: '#8b4513', type: 'sol' as const }
  ];

  selectedElementId = '';
  newColor = '#007bff';

  // Données pour le calculateur de fenêtres
  mursDisponibles = [
    { id: 'mur_principal', nom: 'Mur Principal', dimensions: { width: 8, height: 2.5, depth: 0.2 } },
    { id: 'mur_arriere', nom: 'Mur Arrière', dimensions: { width: 5, height: 2.5, depth: 0.2 } },
    { id: 'mur_gauche', nom: 'Mur Gauche', dimensions: { width: 5, height: 2.5, depth: 0.2 } },
    { id: 'mur_droit', nom: 'Mur Droit', dimensions: { width: 5, height: 2.5, depth: 0.2 } }
  ];

  selectedMurId = '';
  parametresFenetres = {
    tailleFenetre: 'moyen',
    ecart: 0.5,
    nombreFenetres: 2,
    couleur: '#87CEEB'
  };

  // Données pour le contrôleur de murs
  murs = [
    {
      id: 'mur_principal',
      nom: 'Mur Principal',
      position: { x: 0, y: 0, z: 2.3 },
      dimensions: { width: 8, height: 2.5, depth: 0.2 },
      couleur: '#aaaaaa',
      epaisseur: 0.2,
      ouvertures: [
        { id: 'porte', type: 'porte' as const, position: { x: 0, y: 0, z: 0 }, dimensions: { width: 1, height: 2.1, depth: 0.05 }, couleur: '#00ff00' },
        { id: 'fenetre1', type: 'fenetre' as const, position: { x: -1.5, y: 1.5, z: 0 }, dimensions: { width: 1.2, height: 1.5, depth: 0.05 }, couleur: '#ff0000' },
        { id: 'fenetre2', type: 'fenetre' as const, position: { x: 1.5, y: 1.5, z: 0 }, dimensions: { width: 1.2, height: 1.5, depth: 0.05 }, couleur: '#ff0000' }
      ]
    }
  ];

  selectedMurIdMurs = '';

  // Données pour le contrôleur d'ouvertures
  ouvertures = [
    {
      id: 'porte',
      nom: 'Porte d\'entrée',
      type: 'porte' as const,
      position: { x: 0, y: 0, z: 0 },
      dimensions: { width: 1, height: 2.1, depth: 0.05 },
      couleur: '#00ff00',
      murParent: 'mur_principal'
    },
    {
      id: 'fenetre1',
      nom: 'Fenêtre gauche',
      type: 'fenetre' as const,
      position: { x: -1.5, y: 1.5, z: 0 },
      dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
      couleur: '#ff0000',
      murParent: 'mur_principal'
    },
    {
      id: 'fenetre2',
      nom: 'Fenêtre droite',
      type: 'fenetre' as const,
      position: { x: 1.5, y: 1.5, z: 0 },
      dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
      couleur: '#ff0000',
      murParent: 'mur_principal'
    }
  ];

  selectedOuvertureId = '';

  // Données pour le contrôleur de structure
  structure = {
    nom: 'Bâtiment Principal',
    description: 'Bâtiment architectural avec murs, ouvertures et toit',
    type: 'residentiel',
    dimensions: { longueur: 8, largeur: 5, hauteur: 2.5 },
    couleur: '#aaaaaa',
    materiau: 'beton',
    materiauPrincipal: 'beton',
    materiauToit: 'tuile'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private configurationService: ConfigurationService,
    private batimentService: BatimentService,
    private murService: MurService,
    private ouvertureService: OuvertureService,
    private materiauService: MateriauService,
    private sceneService: SceneService,
    private calculateurFenetresService: CalculateurFenetresService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScene();
    }
  }

  ngOnDestroy(): void {
    // Le nettoyage est géré par Scene3dCoreComponent
  }

  private initializeScene(): void {
    // L'initialisation de la scène est maintenant gérée par Scene3dCoreComponent
    // Ici on peut ajouter la logique spécifique au composant principal
  }

  // Méthodes pour les dimensions
  onStructureDimensionsChange(dimensions: any): void {
    this.structureDimensions = dimensions;
    this.updateScene();
  }

  onElementDimensionsChange(dimensions: any): void {
    this.elementDimensions = dimensions;
    this.updateScene();
  }

  onDimensionsReset(): void {
    this.structureDimensions = { longueur: 8, largeur: 5, hauteur: 2.5 };
    this.elementDimensions = { width: 1, height: 2, depth: 0.1 };
    this.updateScene();
  }

  onDimensionsApply(): void {
    this.updateScene();
  }

  // Méthodes pour le sélecteur de couleurs
  onElementSelected(elementId: string): void {
    this.selectedElementId = elementId;
  }

  onColorChanged(data: { elementId: string; color: string }): void {
    const element = this.colorableElements.find(e => e.id === data.elementId);
    if (element) {
      element.currentColor = data.color;
    }
  }

  onColorApplied(data: { elementId: string; color: string }): void {
    this.onColorChanged(data);
    this.updateScene();
  }

  onColorReset(elementId: string): void {
    const element = this.colorableElements.find(e => e.id === elementId);
    if (element) {
      element.currentColor = '#aaaaaa';
      this.updateScene();
    }
  }

  // Méthodes pour le calculateur de fenêtres
  onMurSelected(murId: string): void {
    this.selectedMurId = murId;
  }

  onConfigurationApplied(data: { murId: string; parametres: any; calcul: CalculFenetres }): void {
    console.log('Configuration appliquée:', data);
    this.updateScene();
  }

  onParametresReset(): void {
    this.parametresFenetres = {
      tailleFenetre: 'moyen',
      ecart: 0.5,
      nombreFenetres: 2,
      couleur: '#87CEEB'
    };
  }

  // Méthodes pour le contrôleur de murs
  onMurSelectedMurs(murId: string): void {
    this.selectedMurIdMurs = murId;
  }

  onMurChanged(mur: any): void {
    const index = this.murs.findIndex(m => m.id === mur.id);
    if (index !== -1) {
      this.murs[index] = mur;
      this.updateScene();
    }
  }

  onOuvertureAdded(data: { murId: string; ouverture: any }): void {
    const mur = this.murs.find(m => m.id === data.murId);
    if (mur) {
      mur.ouvertures.push(data.ouverture);
      this.updateScene();
    }
  }

  onOuvertureRemoved(data: { murId: string; index: number }): void {
    const mur = this.murs.find(m => m.id === data.murId);
    if (mur) {
      mur.ouvertures.splice(data.index, 1);
      this.updateScene();
    }
  }

  onMurDuplicated(mur: any): void {
    const newMur = { ...mur, id: `mur_${Date.now()}` };
    this.murs.push(newMur);
    this.updateScene();
  }

  onMurDeleted(murId: string): void {
    this.murs = this.murs.filter(m => m.id !== murId);
    this.updateScene();
  }

  // Méthodes pour le contrôleur d'ouvertures
  onOuvertureSelected(ouvertureId: string): void {
    this.selectedOuvertureId = ouvertureId;
  }

  onOuvertureChanged(ouverture: any): void {
    const index = this.ouvertures.findIndex(o => o.id === ouverture.id);
    if (index !== -1) {
      this.ouvertures[index] = ouverture;
      this.updateScene();
    }
  }

  onOuvertureAddedGlobal(ouverture: any): void {
    this.ouvertures.push(ouverture);
    this.updateScene();
  }

  onOuvertureDuplicated(ouverture: any): void {
    this.ouvertures.push(ouverture);
    this.updateScene();
  }

  onOuvertureDeleted(ouvertureId: string): void {
    this.ouvertures = this.ouvertures.filter(o => o.id !== ouvertureId);
    this.updateScene();
  }

  // Méthodes pour le contrôleur de structure
  onStructureChanged(structure: any): void {
    this.structure = structure;
  }

  onStructureApplied(structure: any): void {
    this.structure = structure;
    this.updateScene();
  }

  onStructureReset(): void {
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
    this.updateScene();
  }

  onStructureOptimized(structure: any): void {
    this.structure = structure;
    this.updateScene();
  }

  onStructureExported(structure: any): void {
    const dataStr = JSON.stringify(structure, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'structure.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  onStructureImported(structure: any): void {
    this.structure = structure;
    this.updateScene();
  }

  onStructurePreviewed(structure: any): void {
    console.log('Aperçu de la structure:', structure);
  }

  // Méthodes d'interface
  toggleDimensionsInterface(): void {
    this.showDimensionsInterface = !this.showDimensionsInterface;
  }

  toggleColorSelector(): void {
    this.showColorSelector = !this.showColorSelector;
  }

  toggleFenetresCalculator(): void {
    this.showFenetresCalculator = !this.showFenetresCalculator;
  }

  toggleMursController(): void {
    this.showMursController = !this.showMursController;
  }

  toggleOuverturesController(): void {
    this.showOuverturesController = !this.showOuverturesController;
  }

  toggleStructureController(): void {
    this.showStructureController = !this.showStructureController;
  }

  openLegendModal(): void {
    this.showLegendModal = true;
  }

  closeLegendModal(): void {
    this.showLegendModal = false;
  }

  openTestModal(): void {
    this.showTestModal = true;
  }

  closeTestModal(): void {
    this.showTestModal = false;
  }

  resetCameraPosition(): void {
    if (this.scene3dCore) {
      this.scene3dCore.resetCamera();
    }
  }

  private updateScene(): void {
    // Méthode pour mettre à jour la scène 3D
    // Cette méthode sera appelée par les sous-composants
    console.log('Mise à jour de la scène 3D');
  }

  // Méthodes pour les événements du composant core
  onSceneReady(scene: THREE.Scene): void {
    console.log('Scène 3D prête:', scene);
    // Ici on peut ajouter les objets 3D à la scène
    this.createBuildingObjects(scene);
  }

  onCameraReady(camera: THREE.PerspectiveCamera): void {
    console.log('Caméra 3D prête:', camera);
  }

  onRendererReady(renderer: THREE.WebGLRenderer): void {
    console.log('Renderer 3D prêt:', renderer);
  }

  private createBuildingObjects(scene: THREE.Scene): void {
    // Création des objets 3D du bâtiment
    // Cette méthode sera appelée quand la scène est prête
    
    // Sol
    const solGeometry = new THREE.BoxGeometry(
      this.structure.dimensions.longueur, 
      0.2, 
      this.structure.dimensions.largeur
    );
    const solMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getColorFromString(this.structure.couleur) 
    });
    const sol = new THREE.Mesh(solGeometry, solMaterial);
    sol.position.set(0, -0.1, 0);
    sol.name = 'sol';
    scene.add(sol);

    // Toit
    const toitGeometry = new THREE.BoxGeometry(
      this.structure.dimensions.longueur + 0.4, 
      0.2, 
      this.structure.dimensions.largeur + 0.4
    );
    const toitMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const toit = new THREE.Mesh(toitGeometry, toitMaterial);
    toit.position.set(0, this.structure.dimensions.hauteur + 0.1, 0);
    toit.name = 'toit';
    scene.add(toit);

    // Murs
    this.createMurs(scene);
  }

  private createMurs(scene: THREE.Scene): void {
    // Création des murs basée sur la configuration
    this.murs.forEach(mur => {
      if (mur.ouvertures.length > 0) {
        // Mur avec ouvertures (ExtrudeGeometry)
        this.createMurAvecOuvertures(scene, mur);
      } else {
        // Mur simple (BoxGeometry)
        this.createMurSimple(scene, mur);
      }
    });
  }

  private createMurSimple(scene: THREE.Scene, mur: any): void {
    const geometry = new THREE.BoxGeometry(
      mur.dimensions.width, 
      mur.dimensions.height, 
      mur.dimensions.depth
    );
    const material = new THREE.MeshStandardMaterial({ 
      color: this.getColorFromString(mur.couleur) 
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(mur.position.x, mur.position.y, mur.position.z);
    mesh.name = mur.id;
    scene.add(mesh);
  }

  private createMurAvecOuvertures(scene: THREE.Scene, mur: any): void {
    // Création d'un mur avec ouvertures en utilisant ExtrudeGeometry
    // Cette méthode est simplifiée pour l'exemple
    const geometry = new THREE.BoxGeometry(
      mur.dimensions.width, 
      mur.dimensions.height, 
      mur.dimensions.depth
    );
    const material = new THREE.MeshStandardMaterial({ 
      color: this.getColorFromString(mur.couleur) 
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(mur.position.x, mur.position.y, mur.position.z);
    mesh.name = mur.id;
    scene.add(mesh);

    // Ajout des ouvertures
    mur.ouvertures.forEach((ouverture: any) => {
      this.createOuverture(scene, ouverture, mur);
    });
  }

  private createOuverture(scene: THREE.Scene, ouverture: any, mur: any): void {
    const geometry = new THREE.BoxGeometry(
      ouverture.dimensions.width, 
      ouverture.dimensions.height, 
      ouverture.dimensions.depth
    );
    const material = new THREE.MeshStandardMaterial({ 
      color: this.getColorFromString(ouverture.couleur),
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      mur.position.x + ouverture.position.x,
      mur.position.y + ouverture.position.y,
      mur.position.z + ouverture.position.z
    );
    mesh.name = ouverture.id;
    scene.add(mesh);
  }

  private getColorFromString(colorString: string): number {
    // Convertit une chaîne de couleur hexadécimale en nombre
    return parseInt(colorString.replace('#', ''), 16);
  }
}

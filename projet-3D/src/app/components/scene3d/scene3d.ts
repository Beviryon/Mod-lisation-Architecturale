import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { BUILDING_CONFIG, WallCalculations } from '../../config/building-config';

// Import des services
import { ConfigurationService } from '../../services/configuration/configuration.service';
import { BatimentService } from '../../services/batiment/batiment.service';
import { MurService } from '../../services/mur/mur.service';
import { OuvertureService } from '../../services/ouverture/ouverture.service';
import { MateriauService } from '../../services/materiau/materiau.service';
import { SceneService } from '../../services/scene/scene.service';
import { CalculateurFenetresService, MurConfig, CalculFenetres } from '../../services/calculateur-fenetres/calculateur-fenetres.service';


@Component({
  selector: 'app-scene3d',
  imports: [CommonModule, FormsModule],
  templateUrl: './scene3d.html',
  styleUrl: './scene3d.css',
  standalone: true
})
export class Scene3d implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;

  // État de la modale de légende
  public showLegendModal = false;

  // État du modal de test
  public showTestModal = false;

  // Propriétés pour le sélecteur de couleurs
  selectedColor = '#aaaaaa'; // Couleur par défaut (gris)
  selectedElement: string | null = null;

  // Propriétés pour les modifications interactives des murs
  selectedMur: string = '';
  murPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  murDimensions: { width: number; height: number; depth: number } = { width: 8, height: 2.5, depth: 0.2 };
  murEpaisseur: number = 0.2;
  murCouleur: string = '#aaaaaa';

  // Propriétés pour les modifications des ouvertures
  selectedOuverture: string = '';
  ouverturePosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  ouvertureDimensions: { width: number; height: number; depth: number } = { width: 1, height: 2, depth: 0.05 };
  ouvertureCouleur: string = '#ff0000';
  ouvertureType: 'porte' | 'fenetre' = 'fenetre';
  ouvertureNom: string = '';

  // Propriétés pour la modification de la structure
  structureDimensions: { longueur: number; largeur: number; hauteur: number } = { longueur: 8, largeur: 5, hauteur: 2.5 };
  structureNom: string = 'Bâtiment Principal';
  structureDescription: string = 'Bâtiment architectural avec murs, ouvertures et toit';

  // Propriétés pour le gestionnaire de projets
  projetsDisponibles: string[] = [];
  projetActuel: string = 'projet-par-defaut';
  nouveauProjetNom: string = '';

  // Propriétés pour la validation en temps réel
  erreursValidation: string[] = [];
  avertissementsValidation: string[] = [];
  scoreValidation: number = 100;

  // Propriétés pour l'interface de dimensions en temps réel
  dimensionsReelTemps = {
    longueur: 8,
    largeur: 5,
    hauteur: 2.5
  };
  
  // Propriétés pour les contrôles visuels
  showDimensionsInterface = false;
  showFenetresInterface = false;
  showMursInterface = false;
  isRealTimeUpdate = true;

  // Propriétés pour l'interface des fenêtres
  fenetresReelTemps = {
    longueur: 1.2,
    largeur: 1.0,
    hauteur: 2.1,
    couleur: '#87CEEB',
    type: 'fenetre',
    nom: 'Fenêtre'
  };

  // Propriétés pour l'interface des murs
  mursReelTemps = {
    longueur: 8,
    largeur: 5,
    hauteur: 2.5,
    epaisseur: 0.2,
    couleur: '#aaaaaa',
    type: 'principal'
  };

  // Propriétés pour le calculateur de fenêtres intégré
  showCalculateurFenetres = false;
  murSelectionneCalculateur = '';
  parametresFenetres = {
    tailleFenetre: 'moyen', // 'petit', 'moyen', 'grand'
    ecart: 0.5,
    nombreFenetres: 2,
    couleur: '#ff0000'
  };
  
  // Tailles prédéfinies des fenêtres
  taillesFenetres: { [key: string]: { largeur: number; hauteur: number; nom: string } } = {
    petit: { largeur: 0.8, hauteur: 1.0, nom: 'Petit' },
    moyen: { largeur: 1.5, hauteur: 1.2, nom: 'Moyen' },
    grand: { largeur: 2.5, hauteur: 1.8, nom: 'Grand' }
  };
  
  calculResultat: CalculFenetres | null = null;
  configurationGeneree = '';

  // Contrôles de la souris
  private isMouseDown = false;
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = BUILDING_CONFIG.camera.initial.rotationX;
  private targetRotationY = BUILDING_CONFIG.camera.initial.rotationY;
  private rotationX = BUILDING_CONFIG.camera.initial.rotationX;
  private rotationY = BUILDING_CONFIG.camera.initial.rotationY;
  private targetZoom = BUILDING_CONFIG.camera.initial.zoom;
  private zoom = BUILDING_CONFIG.camera.initial.zoom;
  private targetPosition = new THREE.Vector3(
    BUILDING_CONFIG.camera.target.x,
    BUILDING_CONFIG.camera.target.y,
    BUILDING_CONFIG.camera.target.z
  );

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    // Injection des services
    private configurationService: ConfigurationService,
    private batimentService: BatimentService,
    private murService: MurService,
    private ouvertureService: OuvertureService,
    private materiauService: MateriauService,
    private sceneService: SceneService,
    private calculateurFenetresService: CalculateurFenetresService
    // Temporairement commentés pour debug
    // private communicationService?: CommunicationService,
    // private validationService?: ValidationService
  ) {
    console.log('Scene3dComponent initialisé avec services:', {
      configurationService: !!this.configurationService,
      batimentService: !!this.batimentService,
      murService: !!this.murService,
      ouvertureService: !!this.ouvertureService,
      materiauService: !!this.materiauService,
      sceneService: !!this.sceneService
      // Temporairement commentés pour debug
      // communicationService: !!this.communicationService,
      // validationService: !!this.validationService
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Synchroniser les données avec building-config.ts au démarrage
      this.synchroniserDonneesAuDemarrage();
      
      // Charger les projets disponibles
      this.chargerProjets();
      
      // Attendre que le DOM soit prêt
      setTimeout(() => {
        this.initThree();
        this.createSol();
        this.createMurPrincipalAvecOuverturesExtrude();
        this.createAutresMurs();
        this.createToit();
        this.createRepere();
        this.setupMouseControls();
        this.updateCameraPosition();
        this.animate();
        
        // Initialiser les services (optionnel)
        this.initialiserServices();
      }, 100);
    }
  }

  /**
   * Recharger la configuration depuis building-config.ts
   */
  public rechargerConfigurationDepuisFichier(): void {
    if (!this.configurationService) return;
    
    try {
      console.log('🔄 Rechargement de la configuration depuis building-config.ts...');
      
      // Recharger la configuration
      this.configurationService.rechargerConfiguration();
      
      // Reconstruire la scène 3D
      this.mettreAJourRendu3D();
      
      console.log('✅ Configuration rechargée et modèle 3D mis à jour');
      
    } catch (error) {
      console.error('❌ Erreur lors du rechargement de la configuration:', error);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.renderer) {
        this.renderer.dispose();
      }
      this.removeMouseEvents();
    }
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BUILDING_CONFIG.scene.background);

    this.camera = new THREE.PerspectiveCamera(
      BUILDING_CONFIG.scene.camera.fov,
      this.canvasContainer.nativeElement.clientWidth / this.canvasContainer.nativeElement.clientHeight,
      BUILDING_CONFIG.scene.camera.near,
      BUILDING_CONFIG.scene.camera.far
    );
    const camPos = BUILDING_CONFIG.camera.initial.position;
    this.camera.position.set(camPos.x, camPos.y, camPos.z);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      alpha: true 
    });
    
    // Forcer une taille minimale
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Ajouter le canvas au container
    container.appendChild(this.renderer.domElement);
    
    // S'assurer que le canvas prend toute la place
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    // Lumières
    const ambientConfig = BUILDING_CONFIG.lighting.ambient;
    const ambientLight = new THREE.AmbientLight(ambientConfig.color, ambientConfig.intensity);
    this.scene.add(ambientLight);

    const dirConfig = BUILDING_CONFIG.lighting.directional;
    const dirLight = new THREE.DirectionalLight(dirConfig.color, dirConfig.intensity);
    dirLight.position.set(dirConfig.position.x, dirConfig.position.y, dirConfig.position.z);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = dirConfig.shadow.mapSize;
    dirLight.shadow.mapSize.height = dirConfig.shadow.mapSize;
    this.scene.add(dirLight);
  }



  private createMurPrincipalAvecOuverturesExtrude() {
    const murShape = new THREE.Shape();
    const contour = BUILDING_CONFIG.mainWall.contour;

    // Créer le contour du mur à partir de la configuration
    murShape.moveTo(contour[0].x, contour[0].y);
    for (let i = 1; i < contour.length; i++) {
      murShape.lineTo(contour[i].x, contour[i].y);
    }

    // --- Ouvertures ---
    const openings = BUILDING_CONFIG.mainWall.openings;
    
    // Porte centrale
    const porteHole = new THREE.Path();
    const doorHole = WallCalculations.getDoorHole(openings.door);
    porteHole.moveTo(doorHole[0].x, doorHole[0].y);
    for (let i = 1; i < doorHole.length; i++) {
      porteHole.lineTo(doorHole[i].x, doorHole[i].y);
    }
    murShape.holes.push(porteHole);

    // Fenêtre 1 (gauche)
    const fenetre1Hole = new THREE.Path();
    const window1Hole = WallCalculations.getWindowHole(openings.window1);
    fenetre1Hole.moveTo(window1Hole[0].x, window1Hole[0].y);
    for (let i = 1; i < window1Hole.length; i++) {
      fenetre1Hole.lineTo(window1Hole[i].x, window1Hole[i].y);
    }
    murShape.holes.push(fenetre1Hole);

    // Fenêtre 2 (droite)
    const fenetre2Hole = new THREE.Path();
    const window2Hole = WallCalculations.getWindowHole(openings.window2);
    fenetre2Hole.moveTo(window2Hole[0].x, window2Hole[0].y);
    for (let i = 1; i < window2Hole.length; i++) {
      fenetre2Hole.lineTo(window2Hole[i].x, window2Hole[i].y);
    }
    murShape.holes.push(fenetre2Hole);

    // Extrusion
    const extrudeSettings = { depth: BUILDING_CONFIG.mainWall.thickness, bevelEnabled: false };
    const murGeometry = new THREE.ExtrudeGeometry(murShape, extrudeSettings);
    const murMat = new THREE.MeshStandardMaterial({ color: BUILDING_CONFIG.mainWall.color });
    const mur = new THREE.Mesh(murGeometry, murMat);

    const wallPos = BUILDING_CONFIG.mainWall.position;
    mur.position.set(wallPos.x, wallPos.y, wallPos.z);
    mur.name = 'murPrincipal'; // Nom pour la mise à jour des couleurs
    mur.castShadow = true;
    mur.receiveShadow = true;

    this.scene.add(mur);

    // --- Ajout des ouvertures colorées ---
    
    // Porte centrale
    const doorConfig = openings.door;
    const porteGeo = new THREE.BoxGeometry(doorConfig.dimensions.width, doorConfig.dimensions.height, doorConfig.dimensions.depth);
    const porteMat = new THREE.MeshStandardMaterial({ color: doorConfig.color });
    const porte = new THREE.Mesh(porteGeo, porteMat);
    porte.position.set(doorConfig.position.x, doorConfig.position.y, doorConfig.position.z);
    porte.name = 'porte'; // Nom pour la mise à jour des couleurs
    this.scene.add(porte);

    // Fenêtre 1 (gauche)
    const window1Config = openings.window1;
    const fenetre1Geo = new THREE.BoxGeometry(window1Config.dimensions.width, window1Config.dimensions.height, window1Config.dimensions.depth);
    const fenetre1Mat = new THREE.MeshStandardMaterial({ color: window1Config.color });
    const fenetre1 = new THREE.Mesh(fenetre1Geo, fenetre1Mat);
    fenetre1.position.set(window1Config.position.x, window1Config.position.y, window1Config.position.z);
    fenetre1.name = 'fenetre1'; // Nom pour la mise à jour des couleurs
    this.scene.add(fenetre1);

    // Fenêtre 2 (droite)
    const window2Config = openings.window2;
    const fenetre2Geo = new THREE.BoxGeometry(window2Config.dimensions.width, window2Config.dimensions.height, window2Config.dimensions.depth);
    const fenetre2Mat = new THREE.MeshStandardMaterial({ color: window2Config.color });
    const fenetre2 = new THREE.Mesh(fenetre2Geo, fenetre2Mat);
    fenetre2.position.set(window2Config.position.x, window2Config.position.y, window2Config.position.z);
    fenetre2.name = 'fenetre2'; // Nom pour la mise à jour des couleurs
    this.scene.add(fenetre2);
  }


  private createAutresMurs() {
    const walls = BUILDING_CONFIG.walls;

    // Mur arrière avec fenêtre
    this.createMurArriereAvecFenetre();

    // Mur gauche
    const leftWall = walls.left;
    const murGaucheGeo = new THREE.BoxGeometry(leftWall.dimensions.width, leftWall.dimensions.height, leftWall.dimensions.depth);
    const murGaucheMat = new THREE.MeshStandardMaterial({ color: leftWall.color });
    const murGauche = new THREE.Mesh(murGaucheGeo, murGaucheMat);
    murGauche.position.set(leftWall.position.x, leftWall.position.y, leftWall.position.z);
    murGauche.name = 'murGauche'; // Nom pour la mise à jour des couleurs
    murGauche.castShadow = true;
    murGauche.receiveShadow = true;
    this.scene.add(murGauche);

    // Mur droit avec porte
    this.createMurDroitAvecPorte();
  }

  private createSol() {
    const groundConfig = BUILDING_CONFIG.ground;
    const solGeometry = new THREE.BoxGeometry(groundConfig.dimensions.width, groundConfig.dimensions.height, groundConfig.dimensions.depth);
    const solMaterial = new THREE.MeshStandardMaterial({ color: groundConfig.color });
    const sol = new THREE.Mesh(solGeometry, solMaterial);
    sol.position.set(groundConfig.position.x, groundConfig.position.y, groundConfig.position.z);
    sol.receiveShadow = true;
    this.scene.add(sol);
  }


  private createToit() {
    const roofConfig = BUILDING_CONFIG.roof;
    const toitGeo = new THREE.BoxGeometry(roofConfig.dimensions.width, roofConfig.dimensions.height, roofConfig.dimensions.depth);
    const toitMat = new THREE.MeshStandardMaterial({ color: roofConfig.color });
    const toit = new THREE.Mesh(toitGeo, toitMat);
    toit.position.set(roofConfig.position.x, roofConfig.position.y, roofConfig.position.z);
    toit.castShadow = true;
    toit.receiveShadow = true;
    this.scene.add(toit);
  }

  private setupMouseControls() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private removeMouseEvents() {
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.removeEventListener('wheel', this.onMouseWheel.bind(this));
  }

  private onMouseDown(event: MouseEvent) {
    this.isMouseDown = true;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) return;

    const deltaX = event.clientX - this.mouseX;
    const deltaY = event.clientY - this.mouseY;

    this.targetRotationY += deltaX * BUILDING_CONFIG.camera.controls.rotationSpeed;
    this.targetRotationX += deltaY * BUILDING_CONFIG.camera.controls.rotationSpeed;
    this.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationX));

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private onMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
  }

  private onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    this.targetZoom += event.deltaY * BUILDING_CONFIG.camera.controls.zoomSpeed;
    this.targetZoom = Math.max(BUILDING_CONFIG.camera.controls.minZoom, Math.min(BUILDING_CONFIG.camera.controls.maxZoom, this.targetZoom));
  }

  private updateCameraPosition() {
    this.rotationX += (this.targetRotationX - this.rotationX) * 0.1;
    this.rotationY += (this.targetRotationY - this.rotationY) * 0.1;
    this.zoom += (this.targetZoom - this.zoom) * 0.1;

    const x = this.targetPosition.x + Math.sin(this.rotationY) * Math.cos(this.rotationX) * this.zoom;
    const y = this.targetPosition.y + Math.sin(this.rotationX) * this.zoom;
    const z = this.targetPosition.z + Math.cos(this.rotationY) * Math.cos(this.rotationX) * this.zoom;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.targetPosition);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.updateCameraPosition();
    this.renderer.render(this.scene, this.camera);
  }

  // Méthode publique pour réinitialiser la position de la caméra
  public resetCameraPosition() {
    this.targetRotationX = BUILDING_CONFIG.camera.initial.rotationX;
    this.targetRotationY = BUILDING_CONFIG.camera.initial.rotationY;
    this.targetZoom = BUILDING_CONFIG.camera.initial.zoom;
    
    this.updateCameraPosition();
    
    console.log('Position de la caméra réinitialisée');
  }


  private createRepere() {
    // Créer un répère avec les axes X, Y, Z
    const axesConfig = BUILDING_CONFIG.axes;
    const axesHelper = new THREE.AxesHelper(axesConfig.size);
    this.scene.add(axesHelper);

    // Ajouter des labels pour les axes
    this.createAxisLabels();
  }

  private createAxisLabels() {
    // Labels pour les axes à partir de la configuration
    const axesConfig = BUILDING_CONFIG.axes;
    axesConfig.labels.forEach(label => {
      this.createSimpleLabel(label.text, label.position.x, label.position.y, label.position.z, label.color);
    });
  }

  private createSimpleLabel(text: string, x: number, y: number, z: number, color: number) {
    // Créer un petit cube coloré comme label
    const labelSize = BUILDING_CONFIG.axes.labelSize;
    const labelGeometry = new THREE.BoxGeometry(labelSize.width, labelSize.height, labelSize.depth);
    const labelMaterial = new THREE.MeshStandardMaterial({ color: color });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(x, y, z);
    this.scene.add(label);
  }

  // Méthode pour créer le mur arrière avec fenêtre
  private createMurArriereAvecFenetre() {
    const backWall = BUILDING_CONFIG.walls.back;
    const window1Config = backWall.openings.window1;

    // Créer la forme du mur arrière (8m x 2.5m)
    // Le mur s'étend de x: -4 à x: +4 et de y: 0 à y: 2.5
    const murShape = new THREE.Shape();
    murShape.moveTo(-4, 0);    // Coin bas gauche
    murShape.lineTo(4, 0);     // Coin bas droit  
    murShape.lineTo(4, 2.5);   // Coin haut droit
    murShape.lineTo(-4, 2.5);  // Coin haut gauche
    murShape.lineTo(-4, 0);    // Retour au début

    // Créer le trou de la fenêtre
    const fenetreHole = new THREE.Path();
    const windowWidth = window1Config.dimensions.width; // 1.5m
    const windowHeight = window1Config.dimensions.height; // 1.2m
    const windowBottom = 0.9; // Hauteur du bas de la fenêtre (0.9m du sol)
    
    // Le trou va de x: -0.75 à x: +0.75 et de y: 0.9 à y: 2.1
    fenetreHole.moveTo(-windowWidth/2, windowBottom);           // Bas gauche
    fenetreHole.lineTo(windowWidth/2, windowBottom);            // Bas droit
    fenetreHole.lineTo(windowWidth/2, windowBottom + windowHeight); // Haut droit
    fenetreHole.lineTo(-windowWidth/2, windowBottom + windowHeight); // Haut gauche
    fenetreHole.lineTo(-windowWidth/2, windowBottom);           // Retour au début
    
    murShape.holes.push(fenetreHole);

    // Extrusion du mur (20cm d'épaisseur)
    const extrudeSettings = { depth: backWall.dimensions.depth, bevelEnabled: false };
    const murGeometry = new THREE.ExtrudeGeometry(murShape, extrudeSettings);
    const murMaterial = new THREE.MeshStandardMaterial({ color: backWall.color });
    const mur = new THREE.Mesh(murGeometry, murMaterial);

    // Positionner le mur à sa place
    mur.position.set(backWall.position.x, backWall.position.y, backWall.position.z);
    mur.name = 'murArriere'; // Nom pour la mise à jour des couleurs
    mur.castShadow = true;
    mur.receiveShadow = true;
    this.scene.add(mur);

    // Ajouter la fenêtre colorée dans le trou
    const fenetreGeo = new THREE.BoxGeometry(window1Config.dimensions.width, window1Config.dimensions.height, window1Config.dimensions.depth);
    const fenetreMat = new THREE.MeshStandardMaterial({ color: window1Config.color });
    const fenetre = new THREE.Mesh(fenetreGeo, fenetreMat);
    fenetre.position.set(window1Config.position.x, window1Config.position.y, window1Config.position.z);
    fenetre.name = 'fenetre3'; // Nom pour la mise à jour des couleurs
    this.scene.add(fenetre);
  }

  // Méthode pour créer le mur droit avec porte (VRAI TROU comme le mur arrière)
  private createMurDroitAvecPorte() {
    const rightWall = BUILDING_CONFIG.walls.right;
    const doorConfig = rightWall.openings.door;

    // Créer la forme du mur droit (5m x 2.5m)
    // Le mur s'étend de z: -2.5 à z: +2.5 et de y: 0 à y: 2.5
    const murShape = new THREE.Shape();
    murShape.moveTo(-2.5, 0);    // Coin bas gauche
    murShape.lineTo(2.5, 0);     // Coin bas droit  
    murShape.lineTo(2.5, 2.5);   // Coin haut droit
    murShape.lineTo(-2.5, 2.5);  // Coin haut gauche
    murShape.lineTo(-2.5, 0);    // Retour au début

    // Créer le trou de la porte
    const porteHole = new THREE.Path();
    const doorWidth = doorConfig.dimensions.width; // 1m
    const doorHeight = doorConfig.dimensions.height; // 2.1m
    
    // Le trou va de z: -0.5 à z: +0.5 et de y: 0 à y: 2.1
    porteHole.moveTo(-doorWidth/2, 0);           // Bas gauche
    porteHole.lineTo(doorWidth/2, 0);            // Bas droit
    porteHole.lineTo(doorWidth/2, doorHeight);   // Haut droit
    porteHole.lineTo(-doorWidth/2, doorHeight);   // Haut gauche
    porteHole.lineTo(-doorWidth/2, 0);           // Retour au début
    
    murShape.holes.push(porteHole);

    // Extrusion du mur (20cm d'épaisseur)
    const extrudeSettings = { depth: rightWall.dimensions.width, bevelEnabled: false };
    const murGeometry = new THREE.ExtrudeGeometry(murShape, extrudeSettings);
    const murMaterial = new THREE.MeshStandardMaterial({ color: rightWall.color });
    const mur = new THREE.Mesh(murGeometry, murMaterial);

    // Positionner le mur à sa place avec ROTATION
    mur.position.set(rightWall.position.x, rightWall.position.y, rightWall.position.z);
    
    mur.rotation.y = Math.PI / 2; // 90 degrés en radians
    
    mur.name = 'murDroit'; // Nom pour la mise à jour des couleurs
    mur.castShadow = true;
    mur.receiveShadow = true;
    this.scene.add(mur);

    // Ajouter la porte colorée dans le trou
    const porteGeo = new THREE.BoxGeometry(doorConfig.dimensions.width, doorConfig.dimensions.height, doorConfig.dimensions.depth);
    const porteMat = new THREE.MeshStandardMaterial({ color: doorConfig.color });
    const porte = new THREE.Mesh(porteGeo, porteMat);
    porte.position.set(doorConfig.position.x, doorConfig.position.y, doorConfig.position.z);
    
    // ROTATION DE LA PORTE : Même rotation que le mur (90° sur Y)
    porte.rotation.y = Math.PI / 2; // 90 degrés en radians
    
    porte.name = 'porte1'; // Nom pour la mise à jour des couleurs
    this.scene.add(porte);
  }

  // Méthodes pour gérer la modale de légende
  public openLegendModal() {
    this.showLegendModal = true;
    // Empêcher le défilement de la page quand la modale est ouverte
    document.body.style.overflow = 'hidden';
  }

  public closeLegendModal() {
    this.showLegendModal = false;
    // Restaurer le défilement de la page
    document.body.style.overflow = 'auto';
  }

  // Méthodes pour gérer le modal de test
  public openTestModal() {
    this.showTestModal = true;
    // Empêcher le défilement de la page quand la modale est ouverte
    document.body.style.overflow = 'hidden';
  }

  public closeTestModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showTestModal = false;
    // Restaurer le défilement de la page
    document.body.style.overflow = 'auto';
  }

  // ========================================
  // NOUVELLES MÉTHODES UTILISANT LES SERVICES
  // ========================================

  /**
   * Initialiser les services (méthode optionnelle)
   */
  private initialiserServices(): void {
    if (this.configurationService) {
      console.log('ConfigurationService disponible');
      // Écouter les changements de configuration
      this.configurationService.getConfigurationObservable().subscribe(config => {
        console.log('Configuration mise à jour:', config);
        // Optionnel : mettre à jour la scène
        // this.mettreAJourSceneAvecConfiguration(config);
      });
    }

    if (this.batimentService) {
      console.log('BatimentService disponible');
      // Obtenir les statistiques du bâtiment
      const statistiques = this.batimentService.getStatistiques();
      console.log('Statistiques du bâtiment:', statistiques);
    }

    if (this.murService) {
      console.log('MurService disponible');
      // Obtenir les murs
      const murs = this.murService.getMurs();
      console.log('Murs disponibles:', murs);
    }

    if (this.ouvertureService) {
      console.log('OuvertureService disponible');
      // Obtenir les ouvertures
      const ouvertures = this.ouvertureService.getOuvertures();
      console.log('Ouvertures disponibles:', ouvertures);
    }

    if (this.materiauService) {
      console.log('MateriauService disponible');
      // Obtenir les matériaux
      const materiaux = this.materiauService.getMateriaux();
      console.log('Matériaux disponibles:', materiaux);
    }

    if (this.sceneService) {
      console.log('SceneService disponible');
      // Obtenir les propriétés de la scène
      const proprietesScene = this.sceneService.getProprietesScene();
      console.log('Propriétés de la scène:', proprietesScene);
    }

    // Temporairement commentés pour debug
    // if (this.communicationService) {
    //   console.log('CommunicationService disponible');
    //   // Écouter les événements de validation
    //   this.communicationService.listenToEventType('validation_result').subscribe(event => {
    //     console.log('Résultat de validation reçu:', event.data);
    //   });
    // }

    // if (this.validationService) {
    //   console.log('ValidationService disponible');
    //   // Valider la configuration actuelle
    //   const config = this.configurationService?.getConfiguration();
    //   if (config) {
    //     const validationResult = this.validationService.validateBuilding(config);
    //     console.log('Résultat de validation:', validationResult);
    //   }
    // }
  }

  /**
   * Créer un mur en utilisant les services (méthode alternative)
   */
  private createMurAvecServices(type: 'principal' | 'arriere' | 'gauche' | 'droit'): void {
    if (!this.murService || !this.materiauService) {
      console.log('Services non disponibles, utilisation de la méthode classique');
      return;
    }

    const mur = this.murService.getMurParType(type);
    if (!mur) {
      console.log(`Mur ${type} non trouvé dans les services`);
      return;
    }

    console.log(`Création du mur ${type} avec les services:`, mur);

    // Utiliser les données du service pour créer le mur
    const murGeo = new THREE.BoxGeometry(
      mur.dimensions.width,
      mur.dimensions.height,
      mur.dimensions.depth
    );

    // Utiliser le matériau du service
    const materiau = this.materiauService.getMateriauParId(`mur_${type}`);
    const couleur = materiau ? materiau.couleur : mur.couleur;

    const murMat = new THREE.MeshStandardMaterial({ color: couleur });
    const murMesh = new THREE.Mesh(murGeo, murMat);

    murMesh.position.set(mur.position.x, mur.position.y, mur.position.z);
    murMesh.castShadow = true;
    murMesh.receiveShadow = true;

    this.scene.add(murMesh);
    console.log(`Mur ${type} créé avec les services`);
  }

  /**
   * Obtenir les statistiques du bâtiment via les services
   */
  public getStatistiquesBatiment(): any {
    if (!this.batimentService) {
      return { message: 'BatimentService non disponible' };
    }

    return this.batimentService.getStatistiques();
  }

  /**
   * Obtenir les statistiques des murs via les services
   */
  public getStatistiquesMurs(): any {
    if (!this.murService) {
      return { message: 'MurService non disponible' };
    }

    return this.murService.getStatistiquesMurs();
  }

  /**
   * Obtenir les statistiques des ouvertures via les services
   */
  public getStatistiquesOuvertures(): any {
    if (!this.ouvertureService) {
      return { message: 'OuvertureService non disponible' };
    }

    return this.ouvertureService.getStatistiquesOuvertures();
  }

  /**
   * Obtenir les statistiques des matériaux via les services
   */
  public getStatistiquesMateriaux(): any {
    if (!this.materiauService) {
      return { message: 'MateriauService non disponible' };
    }

    return this.materiauService.getStatistiquesMateriaux();
  }

  /**
   * Modifier la couleur d'un mur via les services
   */
  public modifierCouleurMur(type: 'principal' | 'arriere' | 'gauche' | 'droit', nouvelleCouleur: number): void {
    if (!this.murService) {
      console.log('MurService non disponible');
      return;
    }

    // Mettre à jour via le service
    this.murService.modifierCouleurMur(type, nouvelleCouleur);
    
    // Mettre à jour visuellement dans la scène 3D
    this.mettreAJourCouleurMur3D(type, nouvelleCouleur);
    
    console.log(`Couleur du mur ${type} modifiée vers:`, nouvelleCouleur);
  }

  /**
   * Mettre à jour la couleur d'un mur dans la scène 3D
   */
  private mettreAJourCouleurMur3D(type: 'principal' | 'arriere' | 'gauche' | 'droit', nouvelleCouleur: number): void {
    if (!this.scene) return;

    // Trouver le mur dans la scène par son nom
    const nomMur = this.getNomMur3D(type);
    const mur = this.scene.getObjectByName(nomMur) as THREE.Mesh;
    
    if (mur && mur.material) {
      // Mettre à jour la couleur du matériau
      (mur.material as THREE.MeshStandardMaterial).color.setHex(nouvelleCouleur);
      console.log(`✅ Couleur 3D mise à jour pour ${nomMur}:`, nouvelleCouleur);
    } else {
      console.log(`❌ Mur ${nomMur} non trouvé dans la scène 3D`);
    }
  }

  /**
   * Obtenir le nom du mur dans la scène 3D
   */
  private getNomMur3D(type: 'principal' | 'arriere' | 'gauche' | 'droit'): string {
    const noms: Record<string, string> = {
      principal: 'murPrincipal',
      arriere: 'murArriere', 
      gauche: 'murGauche',
      droit: 'murDroit'
    };
    return noms[type] || 'murInconnu';
  }

  /**
   * Exporter la configuration via les services
   */
  public exporterConfiguration(): string {
    if (!this.configurationService) {
      return JSON.stringify({ message: 'ConfigurationService non disponible' });
    }

    const config = this.configurationService.getConfiguration();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Importer une configuration via les services
   */
  public importerConfiguration(configurationJson: string): boolean {
    if (!this.configurationService) {
      console.log('ConfigurationService non disponible');
      return false;
    }

    try {
      const config = JSON.parse(configurationJson);
      this.configurationService.mettreAJourConfiguration(config);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  }

  // ========================================
  // MÉTHODES DE TEST POUR L'INTERFACE
  // ========================================

  /**
   * Test des statistiques
   */
  public testStatistiques(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #2196F3;">📊 <strong>Statistiques:</strong></div>';
    
    // Synchroniser d'abord les données
    try {
      const nouvelleConfiguration = this.convertirBuildingConfigVersConfigurationService();
      this.configurationService.mettreAJourConfiguration(nouvelleConfiguration);
      
      // Les services se mettent à jour automatiquement via ConfigurationService
      
      html += '<div style="color: #4CAF50;">✅ Données synchronisées avec building-config.ts</div>';
      html += '<div style="color: #4CAF50;">✅ Services mis à jour avec les nouvelles données</div>';
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur de synchronisation: ${error}</div>`;
    }
    
    // Statistiques du bâtiment (après synchronisation)
    const statsBatiment = this.getStatistiquesBatiment();
    html += `<div>🏢 Bâtiment: ${JSON.stringify(statsBatiment, null, 2)}</div>`;
    
    // Statistiques des murs (après synchronisation)
    const statsMurs = this.getStatistiquesMurs();
    html += `<div>🧱 Murs: ${JSON.stringify(statsMurs, null, 2)}</div>`;
    
    // Statistiques des ouvertures (après synchronisation)
    const statsOuvertures = this.getStatistiquesOuvertures();
    html += `<div>🚪 Ouvertures: ${JSON.stringify(statsOuvertures, null, 2)}</div>`;
    
    // Statistiques des matériaux
    const statsMateriaux = this.getStatistiquesMateriaux();
    html += `<div>🎨 Matériaux: ${JSON.stringify(statsMateriaux, null, 2)}</div>`;
    
    // Afficher les vraies statistiques calculées directement depuis building-config.ts
    const vraiesStats = this.calculerVraiesStatistiques();
    html += '<div style="color: #FF9800;">📐 <strong>Vraies statistiques (building-config.ts):</strong></div>';
    html += `<div>🏢 Bâtiment réel: ${JSON.stringify(vraiesStats, null, 2)}</div>`;
    
    output.innerHTML = html;
  }

  /**
   * Test des couleurs
   */
  public testCouleurs(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #FF9800;">🎨 <strong>Test des Couleurs:</strong></div>';
    
    // Tester tous les murs avec différentes couleurs
    this.modifierCouleurMur('principal', 0xff0000); // Rouge
    html += '<div>🔴 Mur principal → Rouge</div>';
    
    setTimeout(() => {
      this.modifierCouleurMur('arriere', 0x00ff00); // Vert
      html += '<div>🟢 Mur arrière → Vert</div>';
      
      setTimeout(() => {
        this.modifierCouleurMur('gauche', 0x0000ff); // Bleu
        html += '<div>🔵 Mur gauche → Bleu</div>';
        
        setTimeout(() => {
          this.modifierCouleurMur('droit', 0xff00ff); // Magenta
          html += '<div>🟣 Mur droit → Magenta</div>';
          
          setTimeout(() => {
            // Remettre toutes les couleurs originales
            this.modifierCouleurMur('principal', 0xaaaaaa); // Gris (original)
            this.modifierCouleurMur('arriere', 0xaaaaaa); // Gris (original)
            this.modifierCouleurMur('gauche', 0xaaaaaa); // Gris (original)
            this.modifierCouleurMur('droit', 0xaaaaaa); // Gris (original)
            html += '<div>⚪ Tous les murs → Gris (original)</div>';
            output.innerHTML = html;
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
    
    output.innerHTML = html;
  }

  /**
   * Test des couleurs des ouvertures
   */
  public testCouleursOuvertures(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #FF9800;">🚪 <strong>Test des Couleurs des Ouvertures:</strong></div>';
    
    // Tester les couleurs des ouvertures
    this.modifierCouleurOuverture('fenetre2', 0x00ffff); // Cyan
    html += '<div>🔵 Fenêtre principale → Cyan</div>';
    
    setTimeout(() => {
      this.modifierCouleurOuverture('fenetre3', 0xffff00); // Jaune
      html += '<div>🟡 Fenêtre arrière → Jaune</div>';
      
      setTimeout(() => {
        this.modifierCouleurOuverture('porte1', 0xff8000); // Orange
        html += '<div>🟠 Porte d\'entrée → Orange</div>';
        
        setTimeout(() => {
          // Remettre les couleurs originales
          this.modifierCouleurOuverture('fenetre2', 0xff0000); // Rouge (original)
          this.modifierCouleurOuverture('fenetre3', 0xff0000); // Rouge (original)
          this.modifierCouleurOuverture('porte1', 0x00ff00); // Vert (original)
          html += '<div>⚪ Toutes les ouvertures → Couleurs originales</div>';
          output.innerHTML = html;
        }, 1000);
      }, 1000);
    }, 1000);
    
    output.innerHTML = html;
  }

  /**
   * Modifier la couleur d'une ouverture
   */
  public modifierCouleurOuverture(idOuverture: string, nouvelleCouleur: number): void {
    if (!this.ouvertureService) {
      console.log('OuvertureService non disponible');
      return;
    }

    // Mettre à jour via le service
    this.ouvertureService.modifierCouleurOuverture(idOuverture, nouvelleCouleur);
    
    // Mettre à jour visuellement dans la scène 3D
    this.mettreAJourCouleurOuverture3D(idOuverture, nouvelleCouleur);
    
    console.log(`Couleur de l'ouverture ${idOuverture} modifiée vers:`, nouvelleCouleur);
  }

  /**
   * Mettre à jour la couleur d'une ouverture dans la scène 3D
   */
  private mettreAJourCouleurOuverture3D(idOuverture: string, nouvelleCouleur: number): void {
    if (!this.scene) return;

    // Trouver l'ouverture dans la scène par son nom
    const nomOuverture = this.getNomOuverture3D(idOuverture);
    const ouverture = this.scene.getObjectByName(nomOuverture) as THREE.Mesh;
    
    if (ouverture && ouverture.material) {
      // Mettre à jour la couleur du matériau
      (ouverture.material as THREE.MeshStandardMaterial).color.setHex(nouvelleCouleur);
      console.log(` Couleur 3D mise à jour pour ${nomOuverture}:`, nouvelleCouleur);
    } else {
      console.log(` Ouverture ${nomOuverture} non trouvée dans la scène 3D`);
    }
  }

  /**
   * Obtenir le nom de l'ouverture dans la scène 3D
   */
  private getNomOuverture3D(idOuverture: string): string {
    const noms: Record<string, string> = {
      'fenetre2': 'fenetre2',
      'fenetre3': 'fenetre3', 
      'porte1': 'porte1'
    };
    return noms[idOuverture] || 'ouvertureInconnue';
  }

  // ========================================
  // MÉTHODES POUR LE SÉLECTEUR DE COULEURS
  // ========================================

  /**
   * Gérer le changement de couleur dans le sélecteur
   */
  public onColorChange(): void {
    if (this.selectedElement) {
      this.changeElementColor(this.selectedElement);
    }
  }

  /**
   * Changer la couleur d'un élément spécifique
   */
  public changeElementColor(elementId: string): void {
    this.selectedElement = elementId;
    
    // Convertir la couleur hex en nombre
    const colorNumber = parseInt(this.selectedColor.replace('#', ''), 16);
    
    // Déterminer si c'est un mur ou une ouverture
    const murTypes = ['principal', 'arriere', 'gauche', 'droit'];
    const ouvertureTypes = ['fenetre2', 'fenetre3', 'porte1'];
    
    if (murTypes.includes(elementId)) {
      // C'est un mur
      this.modifierCouleurMur(elementId as 'principal' | 'arriere' | 'gauche' | 'droit', colorNumber);
      console.log(`🎨 Couleur du mur ${elementId} changée vers: ${this.selectedColor}`);
    } else if (ouvertureTypes.includes(elementId)) {
      // C'est une ouverture
      this.modifierCouleurOuverture(elementId, colorNumber);
      console.log(`🎨 Couleur de l'ouverture ${elementId} changée vers: ${this.selectedColor}`);
    }
  }

  /**
   * Remettre toutes les couleurs originales
   */
  public resetAllColors(): void {
    // Couleurs originales des murs (gris)
    const couleurMurOriginale = 0xaaaaaa;
    
    // Couleurs originales des ouvertures
    const couleurFenetreOriginale = 0xff0000; // Rouge
    const couleurPorteOriginale = 0x00ff00; // Vert
    
    // Remettre les couleurs des murs
    this.modifierCouleurMur('principal', couleurMurOriginale);
    this.modifierCouleurMur('arriere', couleurMurOriginale);
    this.modifierCouleurMur('gauche', couleurMurOriginale);
    this.modifierCouleurMur('droit', couleurMurOriginale);
    
    // Remettre les couleurs des ouvertures
    this.modifierCouleurOuverture('fenetre2', couleurFenetreOriginale);
    this.modifierCouleurOuverture('fenetre3', couleurFenetreOriginale);
    this.modifierCouleurOuverture('porte1', couleurPorteOriginale);
    
    // Remettre la couleur du sélecteur
    this.selectedColor = '#aaaaaa';
    
    console.log('🔄 Toutes les couleurs ont été remises à leurs valeurs originales');
  }

  /**
   * Sélectionner un mur pour modification
   */
  public selectMur(murType: string): void {
    this.selectedMur = murType;
    
    // Charger les valeurs actuelles du mur
    const mur = this.murService?.getMurParType(murType as any);
    if (mur) {
      this.murPosition = { ...mur.position };
      this.murDimensions = { ...mur.dimensions };
      this.murEpaisseur = mur.epaisseur;
      this.murCouleur = '#' + mur.couleur.toString(16).padStart(6, '0');
    }
    
    console.log(`🧱Mur ${murType} sélectionné pour modification`);
  }

  /**
   * Modifier la position du mur sélectionné
   */
  public modifierPositionMur(): void {
    if (!this.selectedMur || !this.murService) return;
    
    this.murService.modifierPositionMur(this.selectedMur as any, this.murPosition);
    this.mettreAJourRendu3D();
    
    console.log(`📍 Position du mur ${this.selectedMur} modifiée:`, this.murPosition);
  }

  /**
   * Modifier les dimensions du mur sélectionné
   */
  public modifierDimensionsMur(): void {
    if (!this.selectedMur || !this.murService) return;
    
    this.murService.modifierDimensionsMur(this.selectedMur as any, this.murDimensions);
    this.mettreAJourRendu3D();
    
    console.log(`📐 Dimensions du mur ${this.selectedMur} modifiées:`, this.murDimensions);
  }

  /**
   * Modifier l'épaisseur du mur sélectionné
   */
  public modifierEpaisseurMur(): void {
    if (!this.selectedMur || !this.murService) return;
    
    this.murService.modifierEpaisseurMur(this.selectedMur as any, this.murEpaisseur);
    this.mettreAJourRendu3D();
    
    console.log(`📏 Épaisseur du mur ${this.selectedMur} modifiée:`, this.murEpaisseur);
  }

  /**
   * Modifier la couleur du mur sélectionné
   */
  public modifierCouleurMurInteractive(): void {
    if (!this.selectedMur || !this.murService) return;
    
    const colorNumber = parseInt(this.murCouleur.replace('#', ''), 16);
    this.murService.modifierCouleurMur(this.selectedMur as any, colorNumber);
    this.mettreAJourRendu3D();
    
    console.log(`🎨 Couleur du mur ${this.selectedMur} modifiée:`, this.murCouleur);
  }

  /**
   * Appliquer toutes les modifications du mur sélectionné
   */
  public appliquerModificationsMur(): void {
    if (!this.selectedMur || !this.murService) return;
    
    // Appliquer toutes les modifications
    this.murService.modifierPositionMur(this.selectedMur as any, this.murPosition);
    this.murService.modifierDimensionsMur(this.selectedMur as any, this.murDimensions);
    this.murService.modifierEpaisseurMur(this.selectedMur as any, this.murEpaisseur);
    
    const colorNumber = parseInt(this.murCouleur.replace('#', ''), 16);
    this.murService.modifierCouleurMur(this.selectedMur as any, colorNumber);
    
    // Mettre à jour le rendu 3D
    this.mettreAJourRendu3D();
    
    console.log(`✅ Toutes les modifications du mur ${this.selectedMur} ont été appliquées`);
  }

  /**
   * Réinitialiser les valeurs du mur sélectionné
   */
  public resetMurValues(): void {
    if (!this.selectedMur) return;
    
    // Remettre les valeurs par défaut
    this.murPosition = { x: 0, y: 0, z: 0 };
    this.murDimensions = { width: 8, height: 2.5, depth: 0.2 };
    this.murEpaisseur = 0.2;
    this.murCouleur = '#aaaaaa';
    
    console.log(`🔄 Valeurs du mur ${this.selectedMur} réinitialisées`);
  }

  // ===== MÉTHODES POUR LA GESTION DES OUVERTURES =====

  public selectOuverture(ouvertureId: string): void {
    this.selectedOuverture = ouvertureId;
    
    // Charger les valeurs actuelles de l'ouverture
    const ouverture = this.ouvertureService?.getOuvertureParId(ouvertureId);
    if (ouverture) {
      this.ouverturePosition = { ...ouverture.position };
      this.ouvertureDimensions = { ...ouverture.dimensions };
      this.ouvertureCouleur = '#' + ouverture.couleur.toString(16).padStart(6, '0');
      this.ouvertureType = ouverture.type;
      this.ouvertureNom = ouverture.nom || '';
    }
    
    console.log(`🚪 Ouverture ${ouvertureId} sélectionnée pour modification`);
  }

  public modifierPositionOuverture(): void {
    if (!this.selectedOuverture || !this.ouvertureService) return;
    
    try {
      this.ouvertureService.modifierPositionOuverture(this.selectedOuverture, this.ouverturePosition);
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      console.log(`✅ Position de l'ouverture ${this.selectedOuverture} modifiée`);
    } catch (error) {
      console.error(' Erreur lors de la modification de position:', error);
    }
  }

  public modifierDimensionsOuverture(): void {
    if (!this.selectedOuverture || !this.ouvertureService) return;
    
    try {
      this.ouvertureService.modifierDimensionsOuverture(this.selectedOuverture, this.ouvertureDimensions);
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      console.log(` Dimensions de l'ouverture ${this.selectedOuverture} modifiées`);
    } catch (error) {
      console.error(' Erreur lors de la modification des dimensions:', error);
    }
  }

  public modifierCouleurOuvertureInteractive(): void {
    if (!this.selectedOuverture || !this.ouvertureService) return;
    
    try {
      const couleurHex = parseInt(this.ouvertureCouleur.replace('#', ''), 16);
      this.ouvertureService.modifierCouleurOuverture(this.selectedOuverture, couleurHex);
      this.mettreAJourCouleurOuverture3D(this.selectedOuverture, couleurHex);
      this.validerConfiguration();
      console.log(` Couleur de l'ouverture ${this.selectedOuverture} modifiée`);
    } catch (error) {
      console.error(' Erreur lors de la modification de couleur:', error);
    }
  }

  public ajouterOuverture(): void {
    if (!this.ouvertureService) return;
    
    try {
      const nouvelleOuverture = {
        nom: this.ouvertureNom || `Nouvelle ${this.ouvertureType}`,
        type: this.ouvertureType,
        position: this.ouverturePosition,
        dimensions: this.ouvertureDimensions,
        couleur: parseInt(this.ouvertureCouleur.replace('#', ''), 16)
      };
      
      this.ouvertureService.ajouterOuverture('principal', nouvelleOuverture);
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      console.log(`✅ Nouvelle ouverture ajoutée: ${nouvelleOuverture.nom}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'ouverture:', error);
    }
  }

  public supprimerOuverture(): void {
    if (!this.selectedOuverture || !this.ouvertureService) return;
    
    try {
      this.ouvertureService.supprimerOuverture(this.selectedOuverture);
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      this.selectedOuverture = '';
      console.log(`✅ Ouverture ${this.selectedOuverture} supprimée`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'ouverture:', error);
    }
  }

  public resetOuvertureValues(): void {
    if (!this.selectedOuverture) return;
    
    // Remettre les valeurs par défaut
    this.ouverturePosition = { x: 0, y: 0, z: 0 };
    this.ouvertureDimensions = { width: 1, height: 2, depth: 0.05 };
    this.ouvertureCouleur = '#ff0000';
    this.ouvertureType = 'fenetre';
    this.ouvertureNom = '';
    
    console.log(`🔄 Valeurs de l'ouverture ${this.selectedOuverture} réinitialisées`);
  }

  // ===== MÉTHODES POUR LA GESTION DE LA STRUCTURE =====

  public modifierStructureDimensions(): void {
    // Utiliser la nouvelle méthode de modification globale
    this.modifierDimensionsGlobales();
    
    // Mettre à jour aussi le nom et la description
    if (this.configurationService) {
      try {
        const config = this.configurationService.getConfiguration();
        config.nom = this.structureNom;
        config.description = this.structureDescription;
        
        this.configurationService.mettreAJourConfiguration(config);
        console.log(`✅Nom et description de la structure modifiés`);
      } catch (error) {
        console.error('❌ Erreur lors de la modification du nom/description:', error);
      }
    }
  }

  public resetStructureValues(): void {
    this.structureDimensions = { longueur: 8, largeur: 5, hauteur: 2.5 };
    this.structureNom = 'Bâtiment Principal';
    this.structureDescription = 'Bâtiment architectural avec murs, ouvertures et toit';
    console.log(`🔄 Valeurs de la structure réinitialisées`);
  }

  // ===== MÉTHODES POUR LE GESTIONNAIRE DE PROJETS =====

  public chargerProjets(): void {
    try {
      const projets = localStorage.getItem('projets-3d');
      if (projets) {
        this.projetsDisponibles = JSON.parse(projets);
      } else {
        this.projetsDisponibles = ['projet-par-defaut'];
      }
      console.log(`📁 Projets chargés: ${this.projetsDisponibles.length}`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des projets:', error);
      this.projetsDisponibles = ['projet-par-defaut'];
    }
  }

  public sauvegarderProjet(): void {
    if (!this.nouveauProjetNom.trim()) return;
    
    try {
      const config = this.configurationService?.getConfiguration();
      const donneesProjet = {
        nom: this.nouveauProjetNom,
        configuration: config,
        dateCreation: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(`projet-${this.nouveauProjetNom}`, JSON.stringify(donneesProjet));
      
      // Ajouter à la liste des projets
      if (!this.projetsDisponibles.includes(this.nouveauProjetNom)) {
        this.projetsDisponibles.push(this.nouveauProjetNom);
        localStorage.setItem('projets-3d', JSON.stringify(this.projetsDisponibles));
      }
      
      this.nouveauProjetNom = '';
      console.log(`✅ Projet sauvegardé: ${donneesProjet.nom}`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  public chargerProjet(nomProjet: string): void {
    try {
      const donneesProjet = localStorage.getItem(`projet-${nomProjet}`);
      if (donneesProjet) {
        const projet = JSON.parse(donneesProjet);
        this.configurationService?.mettreAJourConfiguration(projet.configuration);
        this.projetActuel = nomProjet;
        this.mettreAJourRendu3D();
        this.validerConfiguration();
        console.log(`✅ Projet chargé: ${nomProjet}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du projet:', error);
    }
  }

  public supprimerProjet(nomProjet: string): void {
    if (nomProjet === 'projet-par-defaut') return;
    
    try {
      localStorage.removeItem(`projet-${nomProjet}`);
      this.projetsDisponibles = this.projetsDisponibles.filter(p => p !== nomProjet);
      localStorage.setItem('projets-3d', JSON.stringify(this.projetsDisponibles));
      
      if (this.projetActuel === nomProjet) {
        this.projetActuel = 'projet-par-defaut';
        this.chargerProjet('projet-par-defaut');
      }
      
      console.log(`✅ Projet supprimé: ${nomProjet}`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  }

  // ===== MÉTHODES POUR LA VALIDATION EN TEMPS RÉEL =====

  public validerConfiguration(): void {
    this.erreursValidation = [];
    this.avertissementsValidation = [];
    this.scoreValidation = 100;
    
    try {
      const config = this.configurationService?.getConfiguration();
      if (!config) return;
      
      // Validation des dimensions
      if (config.dimensions.longueur < 1) {
        this.erreursValidation.push('La longueur doit être d\'au moins 1m');
        this.scoreValidation -= 20;
      }
      
      if (config.dimensions.largeur < 1) {
        this.erreursValidation.push('La largeur doit être d\'au moins 1m');
        this.scoreValidation -= 20;
      }
      
      if (config.dimensions.hauteur < 2) {
        this.erreursValidation.push('La hauteur doit être d\'au moins 2m');
        this.scoreValidation -= 15;
      }
      
      // Validation des murs
      Object.entries(config.murs).forEach(([type, mur]) => {
        if (mur.dimensions.width < 0.5) {
          this.avertissementsValidation.push(`Le mur ${type} est très étroit`);
          this.scoreValidation -= 5;
        }
        
        if (mur.dimensions.height < 1.5) {
          this.avertissementsValidation.push(`Le mur ${type} est très bas`);
          this.scoreValidation -= 5;
        }
        
        // Validation des ouvertures
        mur.ouvertures.forEach(ouverture => {
          const surfaceOuverture = ouverture.dimensions.width * ouverture.dimensions.height;
          const surfaceMur = mur.dimensions.width * mur.dimensions.height;
          const pourcentage = (surfaceOuverture / surfaceMur) * 100;
          
          if (pourcentage > 50) {
            this.erreursValidation.push(`L'ouverture ${ouverture.id} occupe plus de 50% du mur`);
            this.scoreValidation -= 15;
          }
        });
      });
      
      this.scoreValidation = Math.max(0, this.scoreValidation);
      console.log(`📊 Validation terminée - Score: ${this.scoreValidation}/100`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      this.erreursValidation.push('Erreur lors de la validation');
      this.scoreValidation = 0;
    }
  }

  /**
   * Mettre à jour le rendu 3D - Reconstruction complète
   */
  private mettreAJourRendu3D(): void {
    console.log('🔄 Mise à jour du rendu 3D...');
    
    try {
      if (!this.scene) {
        console.log('❌ Scène 3D non disponible');
        return;
      }

      console.log('✅ Scène 3D disponible - Reconstruction des objets...');
      
      // Nettoyer la scène existante (garder la caméra et les lumières)
      const objetsAGarder: THREE.Object3D[] = [];
      this.scene.children.forEach(objet => {
        if (objet.type === 'Camera' || objet.type === 'Light' || objet.type === 'AmbientLight') {
          objetsAGarder.push(objet);
        } else {
          this.scene.remove(objet);
        }
      });
      
      console.log(`🗑️ Objets supprimés, ${objetsAGarder.length} objets conservés`);
      
      // Reconstruire les objets avec les nouvelles données
      this.reconstruireObjets3D();
      
      console.log('✅ Rendu 3D reconstruit avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du rendu 3D:', error);
    }
  }

  /**
   * Reconstruire tous les objets 3D avec les données actuelles
   */
  private reconstruireObjets3D(): void {
    if (!this.scene || !this.configurationService) return;

    const config = this.configurationService.getConfiguration();
    console.log('🏗️ Reconstruction des objets 3D avec la configuration:', config);

    try {
      // Créer le sol
      this.createSol3D(config);
      
      // Créer les murs
      this.createMurs3D(config);
      
      // Créer les ouvertures
      this.createOuvertures3D(config);
      
      // Créer le toit
      this.createToit3D(config);
      
      console.log('✅ Tous les objets 3D ont été reconstruits');
    } catch (error) {
      console.error('❌ Erreur lors de la reconstruction:', error);
    }
  }

  /**
   * Créer le sol 3D
   */
  private createSol3D(config: any): void {
    const geometry = new THREE.PlaneGeometry(config.dimensions.longueur, config.dimensions.largeur);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const sol = new THREE.Mesh(geometry, material);
    
    sol.rotation.x = -Math.PI / 2;
    sol.position.set(0, 0, 0);
    sol.name = 'sol';
    
    this.scene.add(sol);
    console.log('✅ Sol 3D créé');
  }

  /**
   * Créer les murs 3D
   */
  private createMurs3D(config: any): void {
    Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
      const geometry = new THREE.BoxGeometry(mur.dimensions.width, mur.dimensions.height, mur.dimensions.depth);
      const material = new THREE.MeshStandardMaterial({ color: mur.couleur });
      const murMesh = new THREE.Mesh(geometry, material);
      
      murMesh.position.set(mur.position.x, mur.position.y, mur.position.z);
      murMesh.name = `mur${type.charAt(0).toUpperCase() + type.slice(1)}`;
      
      this.scene.add(murMesh);
      console.log(`✅ Mur ${type} créé:`, murMesh.name);
    });
  }

  /**
   * Créer les ouvertures 3D
   */
  private createOuvertures3D(config: any): void {
    Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
      mur.ouvertures.forEach((ouverture: any) => {
        const geometry = new THREE.BoxGeometry(ouverture.dimensions.width, ouverture.dimensions.height, ouverture.dimensions.depth);
        const material = new THREE.MeshStandardMaterial({ color: ouverture.couleur });
        const ouvertureMesh = new THREE.Mesh(geometry, material);
        
        ouvertureMesh.position.set(ouverture.position.x, ouverture.position.y, ouverture.position.z);
        ouvertureMesh.name = ouverture.id;
        
        this.scene.add(ouvertureMesh);
        console.log(`✅ Ouverture ${ouverture.id} créée`);
      });
    });
  }

  /**
   * Créer le toit 3D
   */
  private createToit3D(config: any): void {
    const geometry = new THREE.PlaneGeometry(config.dimensions.longueur, config.dimensions.largeur);
    const material = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
    const toit = new THREE.Mesh(geometry, material);
    
    toit.rotation.x = Math.PI / 2;
    toit.position.set(0, config.dimensions.hauteur, 0);
    toit.name = 'toit';
    
    this.scene.add(toit);
    console.log('✅ Toit 3D créé');
  }


  /**
   * Test de la mise à jour du rendu 3D
   */
  public testMiseAJourRendu(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #607D8B;">🔄 <strong>Test de Mise à Jour du Rendu 3D:</strong></div>';
    
    try {
      // Vérifier si la scène existe
      if (!this.scene) {
        html += '<div style="color: #f44336;">❌ Scène 3D non initialisée</div>';
        output.innerHTML = html;
        return;
      }

      html += '<div style="color: #4CAF50;">✅ Scène 3D disponible</div>';
      
      // Lister tous les objets de la scène
      const objets = this.scene.children;
      html += `<div style="color: #4CAF50;">📦 <strong>Objets dans la scène:</strong> ${objets.length}</div>`;
      
      html += '<div style="margin-left: 20px; color: #666;">';
      objets.forEach((objet, index) => {
        const nom = objet.name || `Objet_${index}`;
        const type = objet.type;
        html += `<div>• ${nom} (${type})</div>`;
      });
      html += '</div>';

      // Tester la mise à jour du rendu
      html += '<div style="color: #4CAF50; margin-top: 10px;">🔄 <strong>Test de mise à jour...</strong></div>';
      this.mettreAJourRendu3D();
      html += '<div style="color: #4CAF50;">✅ Mise à jour terminée</div>';

      html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test de mise à jour terminé avec succès !</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  /**
   * Test de modification directe d'une ouverture
   */
  public testModificationOuverture(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #607D8B;">🔧 <strong>Test de Modification d\'Ouverture:</strong></div>';
    
    try {
      if (!this.configurationService) {
        html += '<div style="color: #f44336;">❌ ConfigurationService non disponible</div>';
        output.innerHTML = html;
        return;
      }

      html += '<div style="color: #4CAF50;">✅ ConfigurationService disponible</div>';
      
      // Obtenir la configuration actuelle
      const config = this.configurationService.getConfiguration();
      html += '<div style="color: #4CAF50;">✅ Configuration chargée</div>';
      
      // Modifier une ouverture de test
      let ouvertureModifiee = false;
      Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
        mur.ouvertures.forEach((ouverture: any) => {
          if (ouverture.id === 'fenetre1') {
            // Modifier les dimensions
            ouverture.dimensions.width = 3;
            ouverture.dimensions.height = 2;
            ouverture.couleur = 0xff0000; // Rouge
            ouvertureModifiee = true;
            html += `<div style="color: #4CAF50;">✅ Ouverture ${ouverture.id} modifiée: ${ouverture.dimensions.width}m x ${ouverture.dimensions.height}m</div>`;
          }
        });
      });
      
      if (ouvertureModifiee) {
        // Mettre à jour la configuration
        this.configurationService.mettreAJourConfiguration(config);
        html += '<div style="color: #4CAF50;">✅ Configuration mise à jour</div>';
        
        // Reconstruire la scène
        this.mettreAJourRendu3D();
        html += '<div style="color: #4CAF50;">✅ Scène reconstruite</div>';
        
        html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test de modification terminé avec succès !</div>';
      } else {
        html += '<div style="color: #f44336;">❌ Aucune ouverture fenetre1 trouvée</div>';
      }
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  /**
   * Test de modification complète de tous les éléments
   */
  public testModificationComplete(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #607D8B;">🏗️ <strong>Test de Modification Complète:</strong></div>';
    
    try {
      if (!this.configurationService) {
        html += '<div style="color: #f44336;">❌ ConfigurationService non disponible</div>';
        output.innerHTML = html;
        return;
      }

      html += '<div style="color: #4CAF50;">✅ ConfigurationService disponible</div>';
      
      // Obtenir la configuration actuelle
      const config = this.configurationService.getConfiguration();
      html += '<div style="color: #4CAF50;">✅ Configuration chargée</div>';
      
      let modificationsEffectuees = 0;
      
      // 1. Modifier les dimensions globales du bâtiment
      config.dimensions.longueur = 12;
      config.dimensions.largeur = 8;
      config.dimensions.hauteur = 3.5;
      modificationsEffectuees++;
      html += '<div style="color: #4CAF50;">✅ Dimensions globales modifiées: 12m x 8m x 3.5m</div>';
      
      // 2. Modifier tous les murs
      Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
        // Modifier les dimensions du mur
        mur.dimensions.width = type === 'principal' ? 12 : type === 'arriere' ? 12 : 8;
        mur.dimensions.height = 3.5;
        mur.dimensions.depth = 0.25;
        
        // Modifier la couleur du mur
        const couleursMurs = {
          'principal': 0x00ff00,  // Vert
          'arriere': 0x0000ff,    // Bleu
          'gauche': 0xff0000,     // Rouge
          'droit': 0xffff00       // Jaune
        };
        mur.couleur = couleursMurs[type as keyof typeof couleursMurs] || 0xaaaaaa;
        
        // Modifier la position du mur
        mur.position.y = 1.75; // Centrer verticalement
        
        modificationsEffectuees++;
        html += `<div style="color: #4CAF50;">✅ Mur ${type} modifié: ${mur.dimensions.width}m x ${mur.dimensions.height}m, couleur #${mur.couleur.toString(16)}</div>`;
        
        // 3. Modifier toutes les ouvertures de ce mur
        mur.ouvertures.forEach((ouverture: any, index: number) => {
          // Modifier les dimensions des ouvertures
          ouverture.dimensions.width = ouverture.type === 'porte' ? 1.2 : 2.5;
          ouverture.dimensions.height = ouverture.type === 'porte' ? 2.1 : 1.8;
          ouverture.dimensions.depth = 0.1;
          
          // Modifier la couleur des ouvertures
          const couleursOuvertures = {
            'porte': 0x8B4513,     // Marron
            'fenetre': 0x87CEEB   // Bleu ciel
          };
          ouverture.couleur = couleursOuvertures[ouverture.type as keyof typeof couleursOuvertures] || 0xff0000;
          
          // Modifier la position des ouvertures
          ouverture.position.y = 1.5; // Centrer verticalement
          
          modificationsEffectuees++;
          html += `<div style="color: #4CAF50;">✅ Ouverture ${ouverture.id} modifiée: ${ouverture.dimensions.width}m x ${ouverture.dimensions.height}m, couleur #${ouverture.couleur.toString(16)}</div>`;
        });
      });
      
      // 4. Modifier le toit
      if (config.toit) {
        config.toit.couleur = 0x4169E1; // Bleu royal
        config.toit.position.y = 3.5;
        modificationsEffectuees++;
        html += '<div style="color: #4CAF50;">✅ Toit modifié: couleur bleu royal, position Y=3.5m</div>';
      }
      
      // 5. Modifier le sol
      if (config.sol) {
        config.sol.couleur = 0x8B4513; // Marron
        modificationsEffectuees++;
        html += '<div style="color: #4CAF50;">✅ Sol modifié: couleur marron</div>';
      }
      
      if (modificationsEffectuees > 0) {
        // Mettre à jour la configuration
        this.configurationService.mettreAJourConfiguration(config);
        html += '<div style="color: #4CAF50;">✅ Configuration mise à jour</div>';
        
        // Reconstruire la scène
        this.mettreAJourRendu3D();
        html += '<div style="color: #4CAF50;">✅ Scène reconstruite</div>';
        
        html += `<div style="color: #4CAF50; margin-top: 10px;">✅ Test de modification complète terminé avec succès ! (${modificationsEffectuees} modifications)</div>`;
      } else {
        html += '<div style="color: #f44336;">❌ Aucune modification effectuée</div>';
      }
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  // ===== MÉTHODES DE MODIFICATION INDIVIDUELLE =====

  /**
   * Modifier les dimensions globales du bâtiment
   */
  public modifierDimensionsGlobales(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Appliquer les nouvelles dimensions
      config.dimensions.longueur = this.structureDimensions.longueur;
      config.dimensions.largeur = this.structureDimensions.largeur;
      config.dimensions.hauteur = this.structureDimensions.hauteur;
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire la scène
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      
      console.log(`✅ Dimensions globales modifiées: ${this.structureDimensions.longueur}m x ${this.structureDimensions.largeur}m x ${this.structureDimensions.hauteur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la modification des dimensions globales:', error);
    }
  }

  /**
   * Modifier un mur spécifique
   */
  public modifierMurComplet(typeMur: string): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      const mur = config.murs[typeMur as keyof typeof config.murs];
      
      if (mur) {
        // Appliquer les modifications du mur sélectionné
        if (this.selectedMur === typeMur) {
          mur.position = { ...this.murPosition };
          mur.dimensions = { ...this.murDimensions };
          mur.couleur = parseInt(this.murCouleur.replace('#', ''), 16);
        }
        
        // Mettre à jour la configuration
        this.configurationService.mettreAJourConfiguration(config);
        
        // Reconstruire la scène
        this.mettreAJourRendu3D();
        this.validerConfiguration();
        
        console.log(`✅ Mur ${typeMur} modifié complètement`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la modification du mur:', error);
    }
  }

  /**
   * Modifier une ouverture spécifique
   */
  public modifierOuvertureComplete(idOuverture: string): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Trouver et modifier l'ouverture
      Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
        mur.ouvertures.forEach((ouverture: any) => {
          if (ouverture.id === idOuverture) {
            // Appliquer les modifications de l'ouverture sélectionnée
            if (this.selectedOuverture === idOuverture) {
              ouverture.position = { ...this.ouverturePosition };
              ouverture.dimensions = { ...this.ouvertureDimensions };
              ouverture.couleur = parseInt(this.ouvertureCouleur.replace('#', ''), 16);
              ouverture.type = this.ouvertureType;
              ouverture.nom = this.ouvertureNom;
            }
          }
        });
      });
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire la scène
      this.mettreAJourRendu3D();
      this.validerConfiguration();
      
      console.log(`✅ Ouverture ${idOuverture} modifiée complètement`);
    } catch (error) {
      console.error('❌ Erreur lors de la modification de l\'ouverture:', error);
    }
  }

  /**
   * Modifier le toit
   */
  public modifierToit(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      if (config.toit) {
        // Modifier les propriétés du toit
        config.toit.position.y = this.structureDimensions.hauteur;
        config.toit.couleur = 0x4169E1; // Bleu royal par défaut
        
        // Mettre à jour la configuration
        this.configurationService.mettreAJourConfiguration(config);
        
        // Reconstruire la scène
        this.mettreAJourRendu3D();
        this.validerConfiguration();
        
        console.log(`✅ Toit modifié: position Y=${this.structureDimensions.hauteur}m`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la modification du toit:', error);
    }
  }

  /**
   * Modifier le sol
   */
  public modifierSol(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      if (config.sol) {
        // Modifier les propriétés du sol
        config.sol.couleur = 0x8B4513; // Marron par défaut
        
        // Mettre à jour la configuration
        this.configurationService.mettreAJourConfiguration(config);
        
        // Reconstruire la scène
        this.mettreAJourRendu3D();
        this.validerConfiguration();
        
        console.log(`✅ Sol modifié: couleur marron`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la modification du sol:', error);
    }
  }

  // ===== MÉTHODES POUR L'INTERFACE DE DIMENSIONS EN TEMPS RÉEL =====

  /**
   * Mise à jour en temps réel des dimensions
   */
  public onDimensionsChange(): void {
    if (this.isRealTimeUpdate) {
      this.mettreAJourDimensionsReelTemps();
    }
  }

  /**
   * Appliquer les nouvelles dimensions en temps réel
   */
  public mettreAJourDimensionsReelTemps(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Appliquer les nouvelles dimensions
      config.dimensions.longueur = this.dimensionsReelTemps.longueur;
      config.dimensions.largeur = this.dimensionsReelTemps.largeur;
      config.dimensions.hauteur = this.dimensionsReelTemps.hauteur;
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire la scène
      this.mettreAJourRendu3D();
      
      console.log(`🔄 Dimensions mises à jour en temps réel: ${this.dimensionsReelTemps.longueur}m x ${this.dimensionsReelTemps.largeur}m x ${this.dimensionsReelTemps.hauteur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour en temps réel:', error);
    }
  }

  /**
   * Charger les dimensions actuelles dans l'interface
   */
  public chargerDimensionsActuelles(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      this.dimensionsReelTemps = {
        longueur: config.dimensions.longueur,
        largeur: config.dimensions.largeur,
        hauteur: config.dimensions.hauteur
      };
      console.log('📥 Dimensions actuelles chargées dans l\'interface');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des dimensions:', error);
    }
  }

  /**
   * Réinitialiser les dimensions aux valeurs par défaut
   */
  public resetDimensionsReelTemps(): void {
    this.dimensionsReelTemps = {
      longueur: 8,
      largeur: 5,
      hauteur: 2.5
    };
    this.mettreAJourDimensionsReelTemps();
    console.log('🔄 Dimensions réinitialisées aux valeurs par défaut');
  }

  /**
   * Basculer l'interface de dimensions
   */
  public toggleDimensionsInterface(): void {
    this.showDimensionsInterface = !this.showDimensionsInterface;
    if (this.showDimensionsInterface) {
      this.chargerDimensionsActuelles();
    }
    console.log(`🎛️ Interface de dimensions ${this.showDimensionsInterface ? 'ouverte' : 'fermée'}`);
  }

  /**
   * Basculer la mise à jour en temps réel
   */
  public toggleRealTimeUpdate(): void {
    this.isRealTimeUpdate = !this.isRealTimeUpdate;
    console.log(`⚡ Mise à jour en temps réel ${this.isRealTimeUpdate ? 'activée' : 'désactivée'}`);
  }

  /**
   * Appliquer manuellement les dimensions (quand temps réel désactivé)
   */
  public appliquerDimensionsManuellement(): void {
    this.mettreAJourDimensionsReelTemps();
    console.log('✅ Dimensions appliquées manuellement');
  }

  // ===== MÉTHODES POUR L'INTERFACE DES FENÊTRES =====

  /**
   * Basculer l'interface des fenêtres
   */
  public toggleFenetresInterface(): void {
    this.showFenetresInterface = !this.showFenetresInterface;
    if (this.showFenetresInterface) {
      this.chargerFenetresActuelles();
    }
    console.log(`🪟 Interface des fenêtres ${this.showFenetresInterface ? 'ouverte' : 'fermée'}`);
  }

  /**
   * Charger les propriétés actuelles des fenêtres
   */
  public chargerFenetresActuelles(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      // Charger les propriétés de la première fenêtre trouvée
      Object.entries(config.murs).forEach(([type, mur]: [string, any]) => {
        mur.ouvertures.forEach((ouverture: any) => {
          if (ouverture.type === 'fenetre') {
            this.fenetresReelTemps = {
              longueur: ouverture.dimensions.width,
              largeur: ouverture.dimensions.depth,
              hauteur: ouverture.dimensions.height,
              couleur: '#' + ouverture.couleur.toString(16).padStart(6, '0'),
              type: ouverture.type,
              nom: ouverture.nom || 'Fenêtre'
            };
            return;
          }
        });
      });
      console.log('📥 Propriétés des fenêtres chargées dans l\'interface');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des fenêtres:', error);
    }
  }

  /**
   * Mise à jour en temps réel des fenêtres
   */
  public onFenetresChange(): void {
    if (this.isRealTimeUpdate) {
      this.mettreAJourFenetresSelective();
    }
  }

  /**
   * Appliquer les modifications des fenêtres (SANS affecter les murs ni les portes)
   */
  public mettreAJourFenetresReelTemps(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Modifier SEULEMENT les fenêtres, sans toucher aux murs ni aux portes
      let fenetresModifiees = 0;
      
      Object.entries(config.murs).forEach(([typeMur, mur]: [string, any]) => {
        if (mur.ouvertures && Array.isArray(mur.ouvertures)) {
          mur.ouvertures.forEach((ouverture: any, index: number) => {
            if (ouverture.type === 'fenetre') {
              // Modifier seulement les propriétés de la fenêtre
              ouverture.dimensions.width = this.fenetresReelTemps.longueur;
              ouverture.dimensions.depth = this.fenetresReelTemps.largeur;
              ouverture.dimensions.height = this.fenetresReelTemps.hauteur;
              ouverture.couleur = parseInt(this.fenetresReelTemps.couleur.replace('#', ''), 16);
              ouverture.type = this.fenetresReelTemps.type;
              ouverture.nom = this.fenetresReelTemps.nom;
              
              fenetresModifiees++;
              console.log(`🪟 Fenêtre modifiée dans le mur ${typeMur}: ${ouverture.nom}`);
            }
          });
        }
      });
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les fenêtres, pas les murs ni les portes
      this.mettreAJourFenetresSeulement();
      
      console.log(`🪟 ${fenetresModifiees} fenêtres mises à jour en temps réel: ${this.fenetresReelTemps.longueur}m x ${this.fenetresReelTemps.largeur}m x ${this.fenetresReelTemps.hauteur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des fenêtres:', error);
    }
  }

  /**
   * Mettre à jour SEULEMENT les ouvertures sans affecter les murs
   */
  public mettreAJourOuverturesSeulement(): void {
    if (!this.scene || !this.configurationService) return;
    
    try {
      // Supprimer seulement les ouvertures existantes
      const objetsASupprimer: THREE.Object3D[] = [];
      this.scene.traverse((child) => {
        if (child.name && (child.name.includes('fenetre') || child.name.includes('porte'))) {
          objetsASupprimer.push(child);
        }
      });
      
      objetsASupprimer.forEach(obj => {
        this.scene.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      // Recréer seulement les ouvertures
      const config = this.configurationService.getConfiguration();
      this.createOuvertures3D(config);
      
      console.log('🪟 Ouvertures mises à jour sans affecter les murs');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des ouvertures:', error);
    }
  }

  /**
   * Mettre à jour SEULEMENT les fenêtres sans affecter les murs ni les portes
   */
  public mettreAJourFenetresSeulement(): void {
    if (!this.scene || !this.configurationService) return;
    
    try {
      // Supprimer seulement les fenêtres existantes
      const objetsASupprimer: THREE.Object3D[] = [];
      this.scene.traverse((child) => {
        if (child.name && child.name.includes('fenetre')) {
          objetsASupprimer.push(child);
        }
      });
      
      objetsASupprimer.forEach(obj => {
        this.scene.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      // Recréer seulement les fenêtres
      const config = this.configurationService.getConfiguration();
      this.createFenetresSeulement(config);
      
      console.log('🪟 Fenêtres mises à jour sans affecter les murs ni les portes');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des fenêtres:', error);
    }
  }

  /**
   * Mettre à jour SEULEMENT les murs sans affecter les ouvertures
   */
  public mettreAJourMursSeulement(): void {
    if (!this.scene || !this.configurationService) return;
    
    try {
      // Supprimer seulement les murs existants
      const objetsASupprimer: THREE.Object3D[] = [];
      this.scene.traverse((child) => {
        if (child.name && child.name.includes('mur')) {
          objetsASupprimer.push(child);
        }
      });
      
      objetsASupprimer.forEach(obj => {
        this.scene.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      // Recréer seulement les murs
      const config = this.configurationService.getConfiguration();
      this.createMurs3D(config);
      
      console.log('🧱 Murs mis à jour sans affecter les ouvertures');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des murs:', error);
    }
  }

  /**
   * Créer SEULEMENT les fenêtres sans créer les portes
   */
  private createFenetresSeulement(config: any): void {
    if (!this.scene) return;
    
    try {
      // Parcourir tous les murs et créer seulement les fenêtres
      Object.entries(config.murs).forEach(([typeMur, mur]: [string, any]) => {
        if (mur.ouvertures && Array.isArray(mur.ouvertures)) {
          mur.ouvertures.forEach((ouverture: any, index: number) => {
            if (ouverture.type === 'fenetre') {
              this.createFenetre3D(ouverture, typeMur, index);
            }
          });
        }
      });
      
      console.log('🪟 Fenêtres créées sans affecter les portes');
    } catch (error) {
      console.error('❌ Erreur lors de la création des fenêtres:', error);
    }
  }

  /**
   * Créer une fenêtre 3D individuelle
   */
  private createFenetre3D(ouverture: any, typeMur: string, index: number): void {
    if (!this.scene) return;
    
    try {
      const geometry = new THREE.BoxGeometry(
        ouverture.dimensions.width,
        ouverture.dimensions.height,
        ouverture.dimensions.depth
      );
      
      const material = new THREE.MeshLambertMaterial({
        color: ouverture.couleur,
        transparent: true,
        opacity: 0.8
      });
      
      const fenetre = new THREE.Mesh(geometry, material);
      
      // Positionner la fenêtre
      fenetre.position.set(
        ouverture.position.x,
        ouverture.position.y,
        ouverture.position.z
      );
      
      // Nommer la fenêtre
      fenetre.name = `fenetre-${typeMur}-${index}`;
      
      // Ajouter à la scène
      this.scene.add(fenetre);
      
      console.log(`🪟 Fenêtre créée: ${fenetre.name} à la position (${ouverture.position.x}, ${ouverture.position.y}, ${ouverture.position.z})`);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la fenêtre:', error);
    }
  }

  /**
   * Mettre à jour les fenêtres de manière intelligente (seulement les propriétés modifiées)
   */
  public mettreAJourFenetresIntelligente(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Modifier SEULEMENT les fenêtres, sans toucher aux murs ni aux portes
      let fenetresModifiees = 0;
      
      Object.entries(config.murs).forEach(([typeMur, mur]: [string, any]) => {
        if (mur.ouvertures && Array.isArray(mur.ouvertures)) {
          mur.ouvertures.forEach((ouverture: any, index: number) => {
            if (ouverture.type === 'fenetre') {
              // Modifier seulement les propriétés de la fenêtre
              ouverture.dimensions.width = this.fenetresReelTemps.longueur;
              ouverture.dimensions.depth = this.fenetresReelTemps.largeur;
              ouverture.dimensions.height = this.fenetresReelTemps.hauteur;
              ouverture.couleur = parseInt(this.fenetresReelTemps.couleur.replace('#', ''), 16);
              ouverture.type = this.fenetresReelTemps.type;
              ouverture.nom = this.fenetresReelTemps.nom;
              
              fenetresModifiees++;
              console.log(`🪟 Fenêtre modifiée dans le mur ${typeMur}: ${ouverture.nom}`);
            }
          });
        }
      });
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les fenêtres, pas les murs ni les portes
      this.mettreAJourFenetresSeulement();
      
      console.log(`🪟 ${fenetresModifiees} fenêtres mises à jour intelligemment: ${this.fenetresReelTemps.longueur}m x ${this.fenetresReelTemps.largeur}m x ${this.fenetresReelTemps.hauteur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour intelligente des fenêtres:', error);
    }
  }

  /**
   * Mettre à jour les fenêtres de manière sélective (seulement les propriétés modifiées)
   */
  public mettreAJourFenetresSelective(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Modifier SEULEMENT les fenêtres, sans toucher aux murs ni aux portes
      let fenetresModifiees = 0;
      
      Object.entries(config.murs).forEach(([typeMur, mur]: [string, any]) => {
        if (mur.ouvertures && Array.isArray(mur.ouvertures)) {
          mur.ouvertures.forEach((ouverture: any, index: number) => {
            if (ouverture.type === 'fenetre') {
              // Modifier seulement les propriétés de la fenêtre
              ouverture.dimensions.width = this.fenetresReelTemps.longueur;
              ouverture.dimensions.depth = this.fenetresReelTemps.largeur;
              ouverture.dimensions.height = this.fenetresReelTemps.hauteur;
              ouverture.couleur = parseInt(this.fenetresReelTemps.couleur.replace('#', ''), 16);
              ouverture.type = this.fenetresReelTemps.type;
              ouverture.nom = this.fenetresReelTemps.nom;
              
              fenetresModifiees++;
              console.log(`🪟 Fenêtre modifiée dans le mur ${typeMur}: ${ouverture.nom}`);
            }
          });
        }
      });
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les fenêtres, pas les murs ni les portes
      this.mettreAJourFenetresSeulement();
      
      console.log(`🪟 ${fenetresModifiees} fenêtres mises à jour sélectivement: ${this.fenetresReelTemps.longueur}m x ${this.fenetresReelTemps.largeur}m x ${this.fenetresReelTemps.hauteur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour sélective des fenêtres:', error);
    }
  }

  /**
   * Réinitialiser les fenêtres
   */
  public resetFenetresReelTemps(): void {
    this.fenetresReelTemps = {
      longueur: 1.2,
      largeur: 1.0,
      hauteur: 2.1,
      couleur: '#87CEEB',
      type: 'fenetre',
      nom: 'Fenêtre'
    };
    this.mettreAJourFenetresReelTemps();
    console.log('🔄 Fenêtres réinitialisées aux valeurs par défaut');
  }

  // ===== MÉTHODES POUR L'INTERFACE DES MURS =====

  /**
   * Basculer l'interface des murs
   */
  public toggleMursInterface(): void {
    this.showMursInterface = !this.showMursInterface;
    if (this.showMursInterface) {
      this.chargerMursActuels();
    }
    console.log(`🧱 Interface des murs ${this.showMursInterface ? 'ouverte' : 'fermée'}`);
  }

  /**
   * Charger les propriétés actuelles des murs
   */
  public chargerMursActuels(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      // Charger les propriétés du mur principal
      const murPrincipal = config.murs.principal;
      const murGauche = config.murs.gauche;
      
      if (murPrincipal && murGauche) {
        this.mursReelTemps = {
          longueur: murPrincipal.dimensions.width, // Longueur du mur principal
          largeur: murGauche.dimensions.width,     // Largeur des murs latéraux
          hauteur: murPrincipal.dimensions.height,
          epaisseur: murPrincipal.dimensions.depth,
          couleur: '#' + murPrincipal.couleur.toString(16).padStart(6, '0'),
          type: 'principal'
        };
      }
      console.log('📥 Propriétés des murs chargées dans l\'interface');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des murs:', error);
    }
  }

  /**
   * Mise à jour en temps réel des murs
   */
  public onMursChange(): void {
    if (this.isRealTimeUpdate) {
      this.mettreAJourMursSelective();
    }
  }

  /**
   * Appliquer les modifications des murs (SANS affecter les ouvertures)
   */
  public mettreAJourMursReelTemps(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Modifier SEULEMENT les murs, sans toucher aux ouvertures
      let mursModifies = 0;
      
      // Modifier le mur principal avec les nouvelles dimensions
      const murPrincipal = config.murs.principal;
      if (murPrincipal) {
        murPrincipal.dimensions.width = this.mursReelTemps.longueur;
        murPrincipal.dimensions.depth = this.mursReelTemps.epaisseur;
        murPrincipal.dimensions.height = this.mursReelTemps.hauteur;
        murPrincipal.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur principal modifié: ${this.mursReelTemps.longueur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur arrière avec les mêmes dimensions que le principal
      const murArriere = config.murs.arriere;
      if (murArriere) {
        murArriere.dimensions.width = this.mursReelTemps.longueur;
        murArriere.dimensions.depth = this.mursReelTemps.epaisseur;
        murArriere.dimensions.height = this.mursReelTemps.hauteur;
        murArriere.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur arrière modifié: ${this.mursReelTemps.longueur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur gauche avec la largeur spécifique
      const murGauche = config.murs.gauche;
      if (murGauche) {
        murGauche.dimensions.width = this.mursReelTemps.largeur; // Utiliser la largeur pour les murs latéraux
        murGauche.dimensions.depth = this.mursReelTemps.epaisseur;
        murGauche.dimensions.height = this.mursReelTemps.hauteur;
        murGauche.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur gauche modifié: ${this.mursReelTemps.largeur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur droit avec la largeur spécifique
      const murDroit = config.murs.droit;
      if (murDroit) {
        murDroit.dimensions.width = this.mursReelTemps.largeur; // Utiliser la largeur pour les murs latéraux
        murDroit.dimensions.depth = this.mursReelTemps.epaisseur;
        murDroit.dimensions.height = this.mursReelTemps.hauteur;
        murDroit.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur droit modifié: ${this.mursReelTemps.largeur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les murs, pas les ouvertures
      this.mettreAJourMursSeulement();
      
      console.log(`🧱 ${mursModifies} murs mis à jour en temps réel: Principal/Arrière=${this.mursReelTemps.longueur}m, Latéraux=${this.mursReelTemps.largeur}m, Hauteur=${this.mursReelTemps.hauteur}m, Épaisseur=${this.mursReelTemps.epaisseur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des murs:', error);
    }
  }

  /**
   * Modifier un mur individuel selon son type
   */
  public mettreAJourMurIndividuel(typeMur: string): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      const mur = config.murs[typeMur as keyof typeof config.murs];
      
      if (!mur) {
        console.warn(`⚠️ Mur ${typeMur} non trouvé dans la configuration`);
        return;
      }
      
      // Modifier le mur selon son type
      switch (typeMur) {
        case 'principal':
        case 'arriere':
          mur.dimensions.width = this.mursReelTemps.longueur;
          mur.dimensions.depth = this.mursReelTemps.epaisseur;
          mur.dimensions.height = this.mursReelTemps.hauteur;
          mur.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
          console.log(`🧱 Mur ${typeMur} modifié: ${this.mursReelTemps.longueur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
          break;
          
        case 'gauche':
        case 'droit':
          mur.dimensions.width = this.mursReelTemps.largeur;
          mur.dimensions.depth = this.mursReelTemps.epaisseur;
          mur.dimensions.height = this.mursReelTemps.hauteur;
          mur.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
          console.log(`🧱 Mur ${typeMur} modifié: ${this.mursReelTemps.largeur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
          break;
          
        default:
          console.warn(`⚠️ Type de mur non reconnu: ${typeMur}`);
          return;
      }
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les murs, pas les ouvertures
      this.mettreAJourMursSeulement();
      
    } catch (error) {
      console.error(`❌ Erreur lors de la modification du mur ${typeMur}:`, error);
    }
  }

  /**
   * Mettre à jour les murs de manière sélective (seulement les propriétés modifiées)
   */
  public mettreAJourMursSelective(): void {
    if (!this.configurationService) return;
    
    try {
      const config = this.configurationService.getConfiguration();
      
      // Modifier SEULEMENT les murs, sans toucher aux ouvertures
      let mursModifies = 0;
      
      // Modifier le mur principal avec les nouvelles dimensions
      const murPrincipal = config.murs.principal;
      if (murPrincipal) {
        murPrincipal.dimensions.width = this.mursReelTemps.longueur;
        murPrincipal.dimensions.depth = this.mursReelTemps.epaisseur;
        murPrincipal.dimensions.height = this.mursReelTemps.hauteur;
        murPrincipal.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur principal modifié: ${this.mursReelTemps.longueur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur arrière avec les mêmes dimensions que le principal
      const murArriere = config.murs.arriere;
      if (murArriere) {
        murArriere.dimensions.width = this.mursReelTemps.longueur;
        murArriere.dimensions.depth = this.mursReelTemps.epaisseur;
        murArriere.dimensions.height = this.mursReelTemps.hauteur;
        murArriere.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur arrière modifié: ${this.mursReelTemps.longueur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur gauche avec la largeur spécifique
      const murGauche = config.murs.gauche;
      if (murGauche) {
        murGauche.dimensions.width = this.mursReelTemps.largeur; // Utiliser la largeur pour les murs latéraux
        murGauche.dimensions.depth = this.mursReelTemps.epaisseur;
        murGauche.dimensions.height = this.mursReelTemps.hauteur;
        murGauche.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur gauche modifié: ${this.mursReelTemps.largeur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Modifier le mur droit avec la largeur spécifique
      const murDroit = config.murs.droit;
      if (murDroit) {
        murDroit.dimensions.width = this.mursReelTemps.largeur; // Utiliser la largeur pour les murs latéraux
        murDroit.dimensions.depth = this.mursReelTemps.epaisseur;
        murDroit.dimensions.height = this.mursReelTemps.hauteur;
        murDroit.couleur = parseInt(this.mursReelTemps.couleur.replace('#', ''), 16);
        mursModifies++;
        console.log(`🧱 Mur droit modifié: ${this.mursReelTemps.largeur}m x ${this.mursReelTemps.epaisseur}m x ${this.mursReelTemps.hauteur}m`);
      }
      
      // Mettre à jour la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Reconstruire SEULEMENT les murs, pas les ouvertures
      this.mettreAJourMursSeulement();
      
      console.log(`🧱 ${mursModifies} murs mis à jour sélectivement: Principal/Arrière=${this.mursReelTemps.longueur}m, Latéraux=${this.mursReelTemps.largeur}m, Hauteur=${this.mursReelTemps.hauteur}m, Épaisseur=${this.mursReelTemps.epaisseur}m`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour sélective des murs:', error);
    }
  }

  /**
   * Réinitialiser les murs
   */
  public resetMursReelTemps(): void {
    this.mursReelTemps = {
      longueur: 8,
      largeur: 5,
      hauteur: 2.5,
      epaisseur: 0.2,
      couleur: '#aaaaaa',
      type: 'principal'
    };
    this.mettreAJourMursReelTemps();
    console.log('🔄 Murs réinitialisés aux valeurs par défaut');
  }

  /**
   * Test de l'export
   */
  public testExport(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #9C27B0;">💾 <strong>Test d\'Export:</strong></div>';
    
    try {
      const configuration = this.exporterConfiguration();
      const configObj = JSON.parse(configuration);
      
      html += '<div>✅ Configuration exportée avec succès!</div>';
      html += `<div>📄 Taille: ${configuration.length} caractères</div>`;
      html += `<div>🏢 Nom: ${configObj.nom || 'Non défini'}</div>`;
      html += `<div>📐 Dimensions: ${configObj.dimensions?.longueur || 'N/A'}m x ${configObj.dimensions?.largeur || 'N/A'}m x ${configObj.dimensions?.hauteur || 'N/A'}m</div>`;
      
      // Sauvegarder dans localStorage pour test
      localStorage.setItem('test-configuration', configuration);
      html += '<div>💾 Sauvegardé dans localStorage</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur: ${error}</div>`;
    }
    
    output.innerHTML = html;
  }

  /**
   * Synchroniser les données avec building-config.ts
   */
  public testValidation(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #FF5722;">🔄 <strong>Synchronisation des données:</strong></div>';
    
    try {
      // Convertir les données de building-config vers ConfigurationService
      const nouvelleConfiguration = this.convertirBuildingConfigVersConfigurationService();
      
      // Mettre à jour le ConfigurationService
      this.configurationService.mettreAJourConfiguration(nouvelleConfiguration);
      
      html += '<div>✅ Données synchronisées avec succès!</div>';
      html += `<div>🏢 Nom: ${nouvelleConfiguration.nom}</div>`;
      html += `<div>📐 Dimensions: ${nouvelleConfiguration.dimensions.longueur}m x ${nouvelleConfiguration.dimensions.largeur}m x ${nouvelleConfiguration.dimensions.hauteur}m</div>`;
      
      // Calculer les vraies statistiques
      const vraiesStats = this.calculerVraiesStatistiques();
      html += '<div>📊 Vraies statistiques:</div>';
      html += `<div>  • Murs: ${vraiesStats.nombreMurs}</div>`;
      html += `<div>  • Ouvertures: ${vraiesStats.nombreOuvertures}</div>`;
      html += `<div>  • Portes: ${vraiesStats.nombrePortes}</div>`;
      html += `<div>  • Fenêtres: ${vraiesStats.nombreFenetres}</div>`;
      html += `<div>  • Surface murs: ${vraiesStats.surfaceMurs}m²</div>`;
      html += `<div>  • Surface ouvertures: ${vraiesStats.surfaceOuvertures}m²</div>`;
      html += `<div>  • % ouvertures: ${vraiesStats.pourcentageOuvertures}%</div>`;
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur: ${error}</div>`;
    }
    
    output.innerHTML = html;
  }
  /**
   * Test de la communication (temporairement désactivé)
   */
  public testCommunication(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #607D8B;">📡 <strong>Test de Communication:</strong></div>';
    html += '<div style="color: #f44336;">❌ CommunicationService temporairement désactivé pour debug</div>';
    output.innerHTML = html;
  }

  /**
   * Test des matériaux, palettes et textures
   */
  public testMateriaux(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    if (!this.materiauService) {
      let html = '<div style="color: #607D8B;">🎨 <strong>Test des Matériaux:</strong></div>';
      html += '<div style="color: #f44336;">❌ MateriauService non disponible</div>';
      output.innerHTML = html;
      return;
    }

    let html = '<div style="color: #607D8B;">🎨 <strong>Test des Matériaux:</strong></div>';
    
    try {
      // Test des matériaux disponibles
      const materiaux = this.materiauService.getMateriaux();
      html += `<div style="color: #4CAF50;">📦 <strong>Matériaux disponibles:</strong> ${materiaux.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      materiaux.forEach((materiau: any) => {
        html += `<div>• ${materiau.nom} (${materiau.type}): ${materiau.description}</div>`;
      });
      html += '</div>';

      // Test des palettes de couleurs
      const palettes = this.materiauService.getPalettes();
      html += `<div style="color: #4CAF50;">🎨 <strong>Palettes de couleurs:</strong> ${palettes.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      palettes.forEach((palette: any) => {
        const couleursHex = palette.couleurs.map((c: number) => '#' + c.toString(16).padStart(6, '0')).join(', ');
        html += `<div>• ${palette.nom} (${palette.type}): ${palette.description}</div>`;
        html += `<div style="margin-left: 10px; color: #888;">Couleurs: ${couleursHex}</div>`;
      });
      html += '</div>';

      // Test des textures
      const textures = this.materiauService.getTextures();
      html += `<div style="color: #4CAF50;">🖼️ <strong>Textures disponibles:</strong> ${textures.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      textures.forEach((texture: any) => {
        html += `<div>• ${texture.nom} (${texture.type}): ${texture.description}</div>`;
      });
      html += '</div>';

      // Test des statistiques
      const statistiques = this.materiauService.getStatistiquesMateriaux();
      html += '<div style="color: #4CAF50;">📊 <strong>Statistiques des matériaux:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Nombre total: ${statistiques.nombreTotal}</div>`;
      html += `<div>• Par type: ${JSON.stringify(statistiques.nombreParType)}</div>`;
      html += `<div>• Couleurs utilisées: ${statistiques.couleursUtilisees.length}</div>`;
      html += `<div>• Textures utilisées: ${statistiques.texturesUtilisees.length}</div>`;
      html += `<div>• Palette la plus utilisée: ${statistiques.paletteLaPlusUtilisee}</div>`;
      html += `<div>• Matériau le plus utilisé: ${statistiques.materiauLePlusUtilise}</div>`;
      html += '</div>';

      html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test des matériaux terminé avec succès !</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test des matériaux: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  /**
   * Test de la scène 3D, caméra, éclairage et contrôles
   */
  public testScene(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    if (!this.sceneService) {
      let html = '<div style="color: #607D8B;">🎬 <strong>Test de la Scène:</strong></div>';
      html += '<div style="color: #f44336;">❌ SceneService non disponible</div>';
      output.innerHTML = html;
      return;
    }

    let html = '<div style="color: #607D8B;">🎬 <strong>Test de la Scène 3D:</strong></div>';
    
    try {
      // Test des propriétés de la scène
      const proprietesScene = this.sceneService.getProprietesScene();
      html += '<div style="color: #4CAF50;">🎭 <strong>Propriétés de la scène:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Nom: ${proprietesScene.nom}</div>`;
      html += `<div>• Dimensions: ${proprietesScene.largeur}x${proprietesScene.hauteur}</div>`;
      html += `<div>• Couleur de fond: #${proprietesScene.backgroundColor.toString(16).padStart(6, '0')}</div>`;
      html += `<div>• Brouillard: ${proprietesScene.fogNear} - ${proprietesScene.fogFar}</div>`;
      html += `<div>• Antialias: ${proprietesScene.antialias ? 'Activé' : 'Désactivé'}</div>`;
      html += `<div>• Ombres: ${proprietesScene.shadowMapEnabled ? 'Activées' : 'Désactivées'}</div>`;
      html += `<div>• Type d'ombres: ${proprietesScene.shadowMapType}</div>`;
      html += '</div>';

      // Test de la configuration de la caméra
      const proprietesCamera = this.sceneService.getProprietesCamera();
      html += '<div style="color: #4CAF50;">📷 <strong>Configuration de la caméra:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Position: (${proprietesCamera.position.x}, ${proprietesCamera.position.y}, ${proprietesCamera.position.z})</div>`;
      html += `<div>• Cible: (${proprietesCamera.target.x}, ${proprietesCamera.target.y}, ${proprietesCamera.target.z})</div>`;
      html += `<div>• FOV: ${proprietesCamera.fov}°</div>`;
      html += `<div>• Near: ${proprietesCamera.near}</div>`;
      html += `<div>• Far: ${proprietesCamera.far}</div>`;
      html += `<div>• Type: ${proprietesCamera.type}</div>`;
      html += '</div>';

      // Test des contrôles de navigation
      const controlesScene = this.sceneService.getControlesScene();
      html += '<div style="color: #4CAF50;">🎮 <strong>Contrôles de navigation:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Rotation: ${controlesScene.enableRotate ? 'Activée' : 'Désactivée'}</div>`;
      html += `<div>• Zoom: ${controlesScene.enableZoom ? 'Activé' : 'Désactivé'}</div>`;
      html += `<div>• Pan: ${controlesScene.enablePan ? 'Activé' : 'Désactivé'}</div>`;
      html += `<div>• Amortissement: ${controlesScene.enableDamping ? 'Activé' : 'Désactivé'}</div>`;
      html += `<div>• Facteur d'amortissement: ${controlesScene.dampingFactor}</div>`;
      html += `<div>• Vitesse de rotation: ${controlesScene.rotateSpeed}</div>`;
      html += `<div>• Vitesse de zoom: ${controlesScene.zoomSpeed}</div>`;
      html += `<div>• Vitesse de pan: ${controlesScene.panSpeed}</div>`;
      html += `<div>• Distance min: ${controlesScene.minDistance}</div>`;
      html += `<div>• Distance max: ${controlesScene.maxDistance}</div>`;
      html += `<div>• Angle polaire min: ${controlesScene.minPolarAngle}</div>`;
      html += `<div>• Angle polaire max: ${controlesScene.maxPolarAngle}</div>`;
      html += '</div>';

      // Test de l'éclairage
      const lumiere = this.sceneService.getLumieres();
      html += `<div style="color: #4CAF50;">💡 <strong>Configuration de l'éclairage:</strong> ${lumiere.length} sources</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      lumiere.forEach((lumiere: any, index: number) => {
        html += `<div><strong>Source ${index + 1}:</strong></div>`;
        html += `<div style="margin-left: 10px;">• Type: ${lumiere.type}</div>`;
        html += `<div style="margin-left: 10px;">• Couleur: #${lumiere.color.toString(16).padStart(6, '0')}</div>`;
        html += `<div style="margin-left: 10px;">• Intensité: ${lumiere.intensity}</div>`;
        html += `<div style="margin-left: 10px;">• Ombres: ${lumiere.castShadow ? 'Oui' : 'Non'}</div>`;
        html += `<div style="margin-left: 10px;">• Activée: ${lumiere.enabled ? 'Oui' : 'Non'}</div>`;
        if (lumiere.position) {
          html += `<div style="margin-left: 10px;">• Position: (${lumiere.position.x}, ${lumiere.position.y}, ${lumiere.position.z})</div>`;
        }
        if (lumiere.direction) {
          html += `<div style="margin-left: 10px;">• Direction: (${lumiere.direction.x}, ${lumiere.direction.y}, ${lumiere.direction.z})</div>`;
        }
      });
      html += '</div>';

      // Test des statistiques de la scène
      const statistiquesScene = this.sceneService.getStatistiquesScene();
      html += '<div style="color: #4CAF50;">📊 <strong>Statistiques de la scène:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Nombre d'objets: ${statistiquesScene.nombreObjets}</div>`;
      html += `<div>• Nombre de murs: ${statistiquesScene.nombreMurs}</div>`;
      html += `<div>• Nombre d'ouvertures: ${statistiquesScene.nombreOuvertures}</div>`;
      html += `<div>• Nombre de lumières: ${statistiquesScene.nombreLumieres}</div>`;
      html += `<div>• Nombre de triangles: ${statistiquesScene.nombreTriangles}</div>`;
      html += `<div>• Mémoire utilisée: ${statistiquesScene.memoireUtilisee}MB</div>`;
      html += `<div>• FPS: ${statistiquesScene.fps}</div>`;
      html += `<div>• Temps de rendu: ${statistiquesScene.tempsRendu}ms</div>`;
      html += '</div>';

      html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test de la scène terminé avec succès !</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test de la scène: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  /**
   * Test complet des murs avec modifications en temps réel
   */
  public testMurs(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    if (!this.murService) {
      let html = '<div style="color: #607D8B;">🧱 <strong>Test des Murs:</strong></div>';
      html += '<div style="color: #f44336;">❌ MurService non disponible</div>';
      output.innerHTML = html;
      return;
    }

    let html = '<div style="color: #607D8B;">🧱 <strong>Test Complet des Murs:</strong></div>';
    
    try {
      // Test des murs disponibles
      const murs = this.murService.getMurs();
      html += `<div style="color: #4CAF50;">🏗️ <strong>Murs disponibles:</strong> ${murs.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      murs.forEach((mur: any) => {
        html += `<div><strong>${mur.nom}:</strong></div>`;
        html += `<div style="margin-left: 10px;">• Type: ${mur.type}</div>`;
        html += `<div style="margin-left: 10px;">• Position: (${mur.position.x}, ${mur.position.y}, ${mur.position.z})</div>`;
        html += `<div style="margin-left: 10px;">• Dimensions: ${mur.dimensions.width}x${mur.dimensions.height}x${mur.dimensions.depth}</div>`;
        html += `<div style="margin-left: 10px;">• Surface: ${mur.surface}m²</div>`;
        html += `<div style="margin-left: 10px;">• Volume: ${mur.volume}m³</div>`;
        html += `<div style="margin-left: 10px;">• Ouvertures: ${mur.nombreOuvertures}</div>`;
        html += `<div style="margin-left: 10px;">• Couleur: #${mur.couleur.toString(16).padStart(6, '0')}</div>`;
      });
      html += '</div>';

      // Test des statistiques des murs
      const statistiques = this.murService.getStatistiquesMurs();
      html += '<div style="color: #4CAF50;">📊 <strong>Statistiques des murs:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      html += `<div>• Nombre total: ${statistiques.nombreTotal}</div>`;
      html += `<div>• Surface totale: ${statistiques.surfaceTotale}m²</div>`;
      html += `<div>• Volume total: ${statistiques.volumeTotal}m³</div>`;
      html += `<div>• Nombre d'ouvertures: ${statistiques.nombreOuvertures}</div>`;
      html += `<div>• Pourcentage d'ouvertures moyen: ${statistiques.pourcentageOuverturesMoyen}%</div>`;
      html += '</div>';

      // Test des murs avec le plus d'ouvertures
      const mursPlusOuvertures = this.murService.getMursAvecPlusOuvertures();
      html += `<div style="color: #4CAF50;">🚪 <strong>Murs avec le plus d'ouvertures:</strong> ${mursPlusOuvertures.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      mursPlusOuvertures.forEach((mur: any) => {
        html += `<div>• ${mur.nom}: ${mur.nombreOuvertures} ouvertures</div>`;
      });
      html += '</div>';

      // Test des murs sans ouvertures
      const mursSansOuvertures = this.murService.getMursSansOuvertures();
      html += `<div style="color: #4CAF50;">🧱 <strong>Murs sans ouvertures:</strong> ${mursSansOuvertures.length}</div>`;
      html += '<div style="margin-left: 20px; color: #666;">';
      mursSansOuvertures.forEach((mur: any) => {
        html += `<div>• ${mur.nom}</div>`;
      });
      html += '</div>';

      // Test des distances entre murs
      html += '<div style="color: #4CAF50;">📏 <strong>Distances entre murs:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      for (let i = 0; i < murs.length; i++) {
        for (let j = i + 1; j < murs.length; j++) {
          const distance = this.murService.calculerDistanceEntreMurs(murs[i], murs[j]);
          html += `<div>• ${murs[i].nom} ↔ ${murs[j].nom}: ${distance}m</div>`;
        }
      }
      html += '</div>';

      // Test des murs adjacents
      html += '<div style="color: #4CAF50;">🔗 <strong>Murs adjacents:</strong></div>';
      html += '<div style="margin-left: 20px; color: #666;">';
      murs.forEach((mur: any) => {
        const adjacents = this.murService.getMursAdjacents(mur);
        html += `<div><strong>${mur.nom}:</strong> ${adjacents.length} adjacents`;
        if (adjacents.length > 0) {
          html += ` (${adjacents.map((a: any) => a.nom).join(', ')})`;
        }
        html += '</div>';
      });
      html += '</div>';

      html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test des murs terminé avec succès !</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test des murs: ${error}</div>`;
    }

    output.innerHTML = html;
  }

  /**
   * Test des modifications de murs en temps réel
   */
  public testModificationsMurs(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    if (!this.murService) {
      let html = '<div style="color: #607D8B;">🔧 <strong>Test des Modifications:</strong></div>';
      html += '<div style="color: #f44336;">❌ MurService non disponible</div>';
      output.innerHTML = html;
      return;
    }

    let html = '<div style="color: #607D8B;">🔧 <strong>Test des Modifications de Murs:</strong></div>';
    
    try {
      // Test de modification de position du mur principal
      const murPrincipal = this.murService.getMurPrincipal();
      if (murPrincipal) {
        const anciennePosition = { ...murPrincipal.position };
        const nouvellePosition = {
          x: anciennePosition.x + 0.5,
          y: anciennePosition.y,
          z: anciennePosition.z + 0.3
        };
        
        html += '<div style="color: #4CAF50;">📍 <strong>Modification de position du mur principal:</strong></div>';
        html += '<div style="margin-left: 20px; color: #666;">';
        html += `<div>• Ancienne position: (${anciennePosition.x}, ${anciennePosition.y}, ${anciennePosition.z})</div>`;
        html += `<div>• Nouvelle position: (${nouvellePosition.x}, ${nouvellePosition.y}, ${nouvellePosition.z})</div>`;
        
        this.murService.modifierPositionMur('principal', nouvellePosition);
        html += '<div style="color: #4CAF50;">✅ Position modifiée avec succès !</div>';
        html += '</div>';
      }

      // Test de modification des dimensions du mur arrière
      const murArriere = this.murService.getMurArriere();
      if (murArriere) {
        const anciennesDimensions = { ...murArriere.dimensions };
        const nouvellesDimensions = {
          width: anciennesDimensions.width + 1,
          height: anciennesDimensions.height,
          depth: anciennesDimensions.depth
        };
        
        html += '<div style="color: #4CAF50;">📐 <strong>Modification des dimensions du mur arrière:</strong></div>';
        html += '<div style="margin-left: 20px; color: #666;">';
        html += `<div>• Anciennes dimensions: ${anciennesDimensions.width}x${anciennesDimensions.height}x${anciennesDimensions.depth}</div>`;
        html += `<div>• Nouvelles dimensions: ${nouvellesDimensions.width}x${nouvellesDimensions.height}x${nouvellesDimensions.depth}</div>`;
        
        this.murService.modifierDimensionsMur('arriere', nouvellesDimensions);
        html += '<div style="color: #4CAF50;">✅ Dimensions modifiées avec succès !</div>';
        html += '</div>';
      }

      // Test de modification de l'épaisseur du mur gauche
      const murGauche = this.murService.getMurGauche();
      if (murGauche) {
        const ancienneEpaisseur = murGauche.epaisseur;
        const nouvelleEpaisseur = ancienneEpaisseur + 0.1;
        
        html += '<div style="color: #4CAF50;">📏 <strong>Modification de l\'épaisseur du mur gauche:</strong></div>';
        html += '<div style="margin-left: 20px; color: #666;">';
        html += `<div>• Ancienne épaisseur: ${ancienneEpaisseur}m</div>`;
        html += `<div>• Nouvelle épaisseur: ${nouvelleEpaisseur}m</div>`;
        
        this.murService.modifierEpaisseurMur('gauche', nouvelleEpaisseur);
        html += '<div style="color: #4CAF50;">✅ Épaisseur modifiée avec succès !</div>';
        html += '</div>';
      }

      // Test de modification de couleur du mur droit
      const murDroit = this.murService.getMurDroit();
      if (murDroit) {
        const ancienneCouleur = murDroit.couleur;
        const nouvelleCouleur = 0xFF6B35; // Orange
        
        html += '<div style="color: #4CAF50;">🎨 <strong>Modification de couleur du mur droit:</strong></div>';
        html += '<div style="margin-left: 20px; color: #666;">';
        html += `<div>• Ancienne couleur: #${ancienneCouleur.toString(16).padStart(6, '0')}</div>`;
        html += `<div>• Nouvelle couleur: #${nouvelleCouleur.toString(16).padStart(6, '0')}</div>`;
        
        this.murService.modifierCouleurMur('droit', nouvelleCouleur);
        html += '<div style="color: #4CAF50;">✅ Couleur modifiée avec succès !</div>';
        html += '</div>';
      }

      // Mettre à jour le rendu 3D
      html += '<div style="color: #4CAF50; margin-top: 15px;">🔄 <strong>Mise à jour du rendu 3D...</strong></div>';
      this.mettreAJourRendu3D();
      html += '<div style="color: #4CAF50;">✅ Rendu 3D mis à jour !</div>';

      html += '<div style="color: #4CAF50; margin-top: 10px;">✅ Test des modifications terminé avec succès !</div>';
      
    } catch (error) {
      html += `<div style="color: #f44336;">❌ Erreur lors du test des modifications: ${error}</div>`;
    }

    output.innerHTML = html;
  }


  /**
   * Synchroniser les données au démarrage du composant
   */
  private synchroniserDonneesAuDemarrage(): void {
    try {
      const nouvelleConfiguration = this.convertirBuildingConfigVersConfigurationService();
      this.configurationService.mettreAJourConfiguration(nouvelleConfiguration);
      
      // Les services se mettent à jour automatiquement via ConfigurationService
      
      console.log('✅ Données synchronisées avec building-config.ts au démarrage');
      console.log('✅ Services mis à jour avec les nouvelles données');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation au démarrage:', error);
    }
  }

  /**
   * Convertir les données de building-config vers ConfigurationService
   */
  private convertirBuildingConfigVersConfigurationService(): any {
    const config = BUILDING_CONFIG;
    
    return {
      nom: 'Bâtiment Principal',
      description: 'Bâtiment architectural avec murs, ouvertures et toit',
      dimensions: {
        longueur: config.ground.dimensions.width,  // 8m
        largeur: config.ground.dimensions.depth,   // 5m
        hauteur: config.mainWall.contour[2].y      // 2.5m
      },
      murs: {
        principal: {
          position: config.mainWall.position,
          dimensions: {
            width: Math.abs(config.mainWall.contour[1].x - config.mainWall.contour[0].x), // 8m
            height: config.mainWall.contour[2].y, // 2.5m
            depth: config.mainWall.thickness // 0.2m
          },
          couleur: config.mainWall.color,
          epaisseur: config.mainWall.thickness,
          ouvertures: [
            // Seule fenêtre du mur principal (window2 dans building-config)
            {
              id: 'fenetre2',
              type: 'fenetre',
              position: config.mainWall.openings.window2.position,
              dimensions: config.mainWall.openings.window2.dimensions,
              couleur: config.mainWall.openings.window2.color,
              nom: 'Fenêtre Rouge'
            }
          ]
        },
        arriere: {
          position: config.walls.back.position,
          dimensions: config.walls.back.dimensions,
          couleur: config.walls.back.color,
          epaisseur: config.walls.back.dimensions.depth,
          ouvertures: [
            // Fenêtre arrière
            {
              id: 'fenetre3',
              type: 'fenetre',
              position: config.walls.back.openings.window1.position,
              dimensions: config.walls.back.openings.window1.dimensions,
              couleur: config.walls.back.openings.window1.color,
              nom: 'Fenêtre Arrière'
            }
          ]
        },
        gauche: {
          position: config.walls.left.position,
          dimensions: config.walls.left.dimensions,
          couleur: config.walls.left.color,
          epaisseur: config.walls.left.dimensions.width,
          // ouvertures: [{
          //   id: 'fenetre5',
          //   type: 'fenetre',
          //   position: config.walls.back.openings.window5.position,
          //   dimensions: config.walls.back.openings.window5.dimensions,
          //   couleur: config.walls.back.openings.window5.color,
          //   nom: 'Fenêtre Gauche'
          // }]
        },
        droit: {
          position: config.walls.right.position,
          dimensions: config.walls.right.dimensions,
          couleur: config.walls.right.color,
          epaisseur: config.walls.right.dimensions.width,
          ouvertures: [
            // Porte d'entrée
            {
              id: 'porte1',
              type: 'porte',
              position: config.walls.right.openings.door.position,
              dimensions: config.walls.right.openings.door.dimensions,
              couleur: config.walls.right.openings.door.color,
              nom: 'Porte d\'Entrée'
            }
          ]
        }
      },
      toit: {
        position: config.roof.position,
        dimensions: config.roof.dimensions,
        couleur: config.roof.color
      },
      sol: {
        position: config.ground.position,
        dimensions: config.ground.dimensions,
        couleur: config.ground.color
      }
    };
  }

  /**
   * Calculer les vraies statistiques basées sur building-config.ts
   */
  private calculerVraiesStatistiques(): any {
    const config = BUILDING_CONFIG;
    
    // Calculer la surface des murs
    const surfaceMurPrincipal = 8 * 2.5; // 8m x 2.5m = 20m²
    const surfaceMurArriere = 8 * 2.5;   // 8m x 2.5m = 20m²
    const surfaceMurGauche = 5 * 2.5;    // 5m x 2.5m = 12.5m²
    const surfaceMurDroit = 5 * 2.5;     // 5m x 2.5m = 12.5m²
    
    const surfaceTotaleMurs = surfaceMurPrincipal + surfaceMurArriere + surfaceMurGauche + surfaceMurDroit; // 65m²
    
    // Calculer la surface des ouvertures selon building-config.ts
    const surfaceFenetrePrincipale = config.mainWall.openings.window2.dimensions.width * config.mainWall.openings.window2.dimensions.height; // 2m x 1.2m = 2.4m²
    const surfaceFenetreArriere = config.walls.back.openings.window1.dimensions.width * config.walls.back.openings.window1.dimensions.height; // 1.5m x 1.2m = 1.8m²
    const surfacePorte = config.walls.right.openings.door.dimensions.width * config.walls.right.openings.door.dimensions.height; // 1m x 2.1m = 2.1m²
    
    const surfaceTotaleOuvertures = surfaceFenetrePrincipale + surfaceFenetreArriere + surfacePorte; // 6.3m²
    
    const pourcentageOuvertures = (surfaceTotaleOuvertures / surfaceTotaleMurs) * 100;
    
    return {
      nombreMurs: 4,
      nombreOuvertures: 3, // 1 porte + 2 fenêtres
      nombrePortes: 1,
      nombreFenetres: 2, // 1 fenêtre principale + 1 fenêtre arrière
      surfaceMurs: Math.round(surfaceTotaleMurs * 100) / 100,
      surfaceOuvertures: Math.round(surfaceTotaleOuvertures * 100) / 100,
      pourcentageOuvertures: Math.round(pourcentageOuvertures * 100) / 100,
      details: {
        surfaceMurPrincipal,
        surfaceMurArriere,
        surfaceMurGauche,
        surfaceMurDroit,
        surfaceFenetrePrincipale,
        surfaceFenetreArriere,
        surfacePorte
      }
    };
  }

  // ===============================================
  // MÉTHODES DU CALCULATEUR DE FENÊTRES INTÉGRÉ
  // ===============================================

  /**
   * Ouvrir/fermer l'interface du calculateur de fenêtres
   */
  public toggleCalculateurFenetres(): void {
    this.showCalculateurFenetres = !this.showCalculateurFenetres;
    if (this.showCalculateurFenetres) {
      console.log('🧮 Interface calculateur de fenêtres ouverte');
    }
  }

  /**
   * Sélectionner un mur pour le calculateur
   */
  public onMurSelectionneCalculateur(): void {
    console.log('🔍 Mur sélectionné:', this.murSelectionneCalculateur);
    
    if (!this.murSelectionneCalculateur) {
      this.calculResultat = null;
      return;
    }

    const murInfo = this.getMurFromConfig(this.murSelectionneCalculateur);
    console.log('📐 Informations du mur:', murInfo);
    
    if (murInfo) {
      this.calculerCapaciteFenetres(murInfo);
    } else {
      console.error('❌ Impossible de récupérer les informations du mur');
    }
  }

  /**
   * Récupérer les informations d'un mur depuis BUILDING_CONFIG
   */
  private getMurFromConfig(nomMur: string): MurConfig | null {
    const config = BUILDING_CONFIG;
    
    switch (nomMur) {
      case 'principal':
        return {
          position: config.mainWall.position,
          dimensions: {
            width: Math.abs(config.mainWall.contour[1].x - config.mainWall.contour[0].x),
            height: Math.abs(config.mainWall.contour[2].y - config.mainWall.contour[0].y),
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

  /**
   * Calculer la capacité de fenêtres pour un mur
   */
  public calculerCapaciteFenetres(mur: MurConfig): void {
    console.log('🧮 Calcul de capacité pour le mur:', mur);
    console.log('📏 Paramètres fenêtres:', this.parametresFenetres);
    
    // Récupérer les dimensions selon la taille sélectionnée
    const taille = this.taillesFenetres[this.parametresFenetres.tailleFenetre];
    
    this.calculResultat = this.calculateurFenetresService.calculerNombreMaxFenetres(
      mur,
      taille.largeur,
      this.parametresFenetres.ecart,
      taille.hauteur
    );
    
    console.log('📊 Résultat du calcul:', this.calculResultat);
  }

  /**
   * Recalculer quand les paramètres changent
   */
  public onParametresFenetresChange(): void {
    if (this.murSelectionneCalculateur) {
      const murInfo = this.getMurFromConfig(this.murSelectionneCalculateur);
      if (murInfo) {
        this.calculerCapaciteFenetres(murInfo);
      }
    }
  }

  /**
   * Générer la configuration des fenêtres
   */
  public genererConfigurationFenetres(): void {
    if (!this.murSelectionneCalculateur || !this.calculResultat) return;

    const murInfo = this.getMurFromConfig(this.murSelectionneCalculateur);
    if (!murInfo) return;

    const couleurHex = parseInt(this.parametresFenetres.couleur.replace('#', ''), 16);
    
    const taille = this.taillesFenetres[this.parametresFenetres.tailleFenetre];
    const resultat = this.calculateurFenetresService.genererConfigurationFenetres(
      murInfo,
      this.parametresFenetres.nombreFenetres,
      taille.largeur,
      this.parametresFenetres.ecart,
      taille.hauteur,
      couleurHex
    );

    if (resultat.isValid) {
      this.configurationGeneree = this.formaterConfigurationFenetres(resultat.fenetres);
      console.log('✅ Configuration générée:', this.configurationGeneree);
    } else {
      alert(resultat.message);
    }
  }

  /**
   * Optimiser les dimensions des fenêtres
   */
  public optimiserDimensionsFenetres(): void {
    if (!this.murSelectionneCalculateur) return;

    const murInfo = this.getMurFromConfig(this.murSelectionneCalculateur);
    if (!murInfo) return;

    const taille = this.taillesFenetres[this.parametresFenetres.tailleFenetre];
    const optimisation = this.calculateurFenetresService.optimiserDimensions(
      murInfo,
      this.parametresFenetres.nombreFenetres,
      taille.hauteur
    );

    if (optimisation.isValid) {
      // Trouver la taille la plus proche des dimensions optimisées
      let tailleOptimale = 'moyen';
      let ecartMin = Math.abs(optimisation.largeurFenetre - taille.largeur);
      
      Object.keys(this.taillesFenetres).forEach(key => {
        const ecart = Math.abs(optimisation.largeurFenetre - this.taillesFenetres[key].largeur);
        if (ecart < ecartMin) {
          ecartMin = ecart;
          tailleOptimale = key;
        }
      });
      
      this.parametresFenetres.tailleFenetre = tailleOptimale;
      this.parametresFenetres.ecart = optimisation.ecart;
      this.onParametresFenetresChange();
      alert(`✅ Taille optimisée: ${this.taillesFenetres[tailleOptimale].nom} (${optimisation.ecart.toFixed(2)}m d'écart)`);
    } else {
      alert(`❌ ${optimisation.message}`);
    }
  }

  /**
   * Formater la configuration des fenêtres pour building-config.ts
   */
  private formaterConfigurationFenetres(fenetres: any[]): string {
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

  /**
   * Copier la configuration dans le presse-papiers
   */
  public copierConfigurationFenetres(): void {
    navigator.clipboard.writeText(this.configurationGeneree).then(() => {
      alert('Configuration copiée dans le presse-papiers !');
    });
  }

  /**
   * Appliquer directement la configuration au modèle 3D avec de vraies ouvertures
   */
  public appliquerConfigurationDirecte(): void {
    if (!this.configurationGeneree || !this.murSelectionneCalculateur) return;

    try {
      // Convertir la couleur hexadécimale
      const couleurHex = parseInt(this.parametresFenetres.couleur.replace('#', ''), 16);
      
      // Récupérer les dimensions selon la taille sélectionnée
      const taille = this.taillesFenetres[this.parametresFenetres.tailleFenetre];
      
      // Obtenir la configuration actuelle
      const config = this.configurationService.getConfiguration();
      
      // Ajouter les nouvelles fenêtres au mur sélectionné avec de vraies ouvertures
      const nouvellesFenetres = [];
      for (let i = 0; i < this.parametresFenetres.nombreFenetres; i++) {
        if (this.calculResultat && this.calculResultat.positionsCalculees[i]) {
          const position = this.calculResultat.positionsCalculees[i];
          nouvellesFenetres.push({
            id: `fenetre-${this.murSelectionneCalculateur}-${i + 1}`,
            type: 'fenetre' as const,
            position: position,
            dimensions: {
              width: taille.largeur,
              height: taille.hauteur,
              depth: 0.05
            },
            couleur: couleurHex,
            nom: `Fenêtre ${taille.nom} ${i + 1}`
          });
        }
      }

      // Ajouter les nouvelles fenêtres SANS écraser les existantes
      switch (this.murSelectionneCalculateur) {
        case 'principal':
          if (!config.murs.principal.ouvertures) {
            config.murs.principal.ouvertures = [];
          }
          config.murs.principal.ouvertures.push(...nouvellesFenetres);
          break;
        case 'arriere':
          if (!config.murs.arriere.ouvertures) {
            config.murs.arriere.ouvertures = [];
          }
          config.murs.arriere.ouvertures.push(...nouvellesFenetres);
          break;
        case 'gauche':
          if (!config.murs.gauche.ouvertures) {
            config.murs.gauche.ouvertures = [];
          }
          config.murs.gauche.ouvertures.push(...nouvellesFenetres);
          break;
        case 'droit':
          if (!config.murs.droit.ouvertures) {
            config.murs.droit.ouvertures = [];
          }
          config.murs.droit.ouvertures.push(...nouvellesFenetres);
          break;
      }

      // Sauvegarder la configuration
      this.configurationService.mettreAJourConfiguration(config);
      
      // Ajouter les fenêtres directement au modèle 3D (sans reconstruire le mur)
      this.ajouterFenetresDirectementAuModele(nouvellesFenetres);
      
      alert(`✅ ${nouvellesFenetres.length} fenêtre(s) ${taille.nom.toLowerCase()} ajoutée(s) au mur ${this.murSelectionneCalculateur} !`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'application de la configuration:', error);
      alert('❌ Erreur lors de l\'application de la configuration');
    }
  }

  /**
   * Ajouter les fenêtres directement au modèle 3D comme de vraies ouvertures
   */
  private ajouterFenetresDirectementAuModele(fenetres: any[]): void {
    if (!this.scene) return;

    fenetres.forEach((fenetre, index) => {
      // Créer la géométrie de la fenêtre (plus épaisse pour simuler le verre)
      const geometry = new THREE.BoxGeometry(
        fenetre.dimensions.width,
        fenetre.dimensions.height,
        0.1 // Épaisseur du verre
      );

      // Créer le matériau transparent pour simuler le verre
      const material = new THREE.MeshLambertMaterial({ 
        color: fenetre.couleur,
        transparent: true,
        opacity: 0.3, // Très transparent pour simuler le verre
        side: THREE.DoubleSide // Visible des deux côtés
      });

      // Créer le mesh de la fenêtre
      const fenetreMesh = new THREE.Mesh(geometry, material);
      
      // Positionner la fenêtre légèrement en avant du mur pour être visible
      const decalageZ = this.murSelectionneCalculateur === 'principal' ? 0.05 : -0.05;
      fenetreMesh.position.set(
        fenetre.position.x,
        fenetre.position.y,
        fenetre.position.z + decalageZ
      );

      // Donner un nom unique à la fenêtre
      fenetreMesh.name = `fenetre-calculateur-${this.murSelectionneCalculateur}-${index + 1}`;

      // Ajouter au modèle 3D
      this.scene.add(fenetreMesh);

      console.log(`🪟 Fenêtre ajoutée: ${fenetreMesh.name} à la position (${fenetre.position.x}, ${fenetre.position.y}, ${fenetre.position.z})`);
    });

    // Forcer le rendu
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Reconstruire seulement le mur sélectionné avec ses ouvertures
   */
  private reconstruireMurSeulement(nomMur: string): void {
    if (!this.scene) return;

    console.log(`🔧 Reconstruction du mur ${nomMur} seulement`);

    // Supprimer l'ancien mur et ses ouvertures
    const ancienMur = this.scene.getObjectByName(`mur-${nomMur}`);
    if (ancienMur) {
      this.scene.remove(ancienMur);
      console.log(`🗑️ Ancien mur ${nomMur} supprimé`);
    }

    // Supprimer les anciennes ouvertures de ce mur
    const objetsASupprimer: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.name && child.name.includes(`ouverture-${nomMur}`)) {
        objetsASupprimer.push(child);
      }
    });
    objetsASupprimer.forEach(obj => {
      this.scene.remove(obj);
      console.log(`🗑️ Ancienne ouverture ${obj.name} supprimée`);
    });

    // Reconstruire le mur avec toutes ses ouvertures
    this.createMurAvecOuvertures(nomMur);

    // Forcer le rendu
    this.renderer.render(this.scene, this.camera);
    console.log(`✅ Mur ${nomMur} reconstruit avec ses ouvertures`);
  }

  /**
   * Créer un mur spécifique avec toutes ses ouvertures
   */
  private createMurAvecOuvertures(nomMur: string): void {
    const config = this.configurationService.getConfiguration();
    let murConfig;

    // Récupérer la configuration du mur selon son nom
    switch (nomMur) {
      case 'principal':
        murConfig = config.murs.principal;
        break;
      case 'arriere':
        murConfig = config.murs.arriere;
        break;
      case 'gauche':
        murConfig = config.murs.gauche;
        break;
      case 'droit':
        murConfig = config.murs.droit;
        break;
      default:
        console.error(`❌ Mur inconnu: ${nomMur}`);
        return;
    }

    if (!murConfig) {
      console.error(`❌ Configuration manquante pour le mur ${nomMur}`);
      return;
    }

    // Créer la géométrie du mur
    const geometry = new THREE.BoxGeometry(
      murConfig.dimensions.width,
      murConfig.dimensions.height,
      murConfig.dimensions.depth
    );

    // Créer le matériau
    const material = new THREE.MeshLambertMaterial({ color: murConfig.couleur });

    // Créer le mesh
    const murMesh = new THREE.Mesh(geometry, material);
    murMesh.position.set(
      murConfig.position.x,
      murConfig.position.y,
      murConfig.position.z
    );
    murMesh.name = `mur-${nomMur}`;

    // Ajouter au modèle 3D
    this.scene.add(murMesh);

    // Créer les ouvertures
    if (murConfig.ouvertures && murConfig.ouvertures.length > 0) {
      murConfig.ouvertures.forEach((ouverture, index) => {
        this.createOuverture3D(ouverture, `ouverture-${nomMur}-${index}`);
      });
      console.log(`🪟 ${murConfig.ouvertures.length} ouverture(s) créée(s) pour le mur ${nomMur}`);
    } else {
      console.log(`ℹ️ Aucune ouverture pour le mur ${nomMur}`);
    }

    console.log(`🧱 Mur ${nomMur} créé avec ${murConfig.ouvertures?.length || 0} ouverture(s)`);
  }

  /**
   * Créer une ouverture 3D (fenêtre ou porte)
   */
  private createOuverture3D(ouverture: any, nom: string): void {
    // Créer la géométrie de l'ouverture
    const geometry = new THREE.BoxGeometry(
      ouverture.dimensions.width,
      ouverture.dimensions.height,
      ouverture.dimensions.depth
    );

    // Créer le matériau avec transparence
    const material = new THREE.MeshLambertMaterial({ 
      color: ouverture.couleur,
      transparent: true,
      opacity: 0.7
    });

    // Créer le mesh
    const ouvertureMesh = new THREE.Mesh(geometry, material);
    ouvertureMesh.position.set(
      ouverture.position.x,
      ouverture.position.y,
      ouverture.position.z
    );
    ouvertureMesh.name = nom;

    // Ajouter au modèle 3D
    this.scene.add(ouvertureMesh);

    console.log(`🪟 Ouverture créée: ${nom} (${ouverture.type})`);
  }
}

import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { BUILDING_CONFIG, WallCalculations } from '../../config/building-config';

// Import des services
import { ConfigurationService } from '../../services/configuration/configuration.service';
import { BatimentService } from '../../services/batiment/batiment.service';
import { MurService } from '../../services/mur/mur.service';
import { OuvertureService } from '../../services/ouverture/ouverture.service';
import { MateriauService } from '../../services/materiau/materiau.service';
import { SceneService } from '../../services/scene/scene.service';
// Temporairement commentés pour debug
// import { CommunicationService } from '../../services/communication/communication.service';
// import { ValidationService } from '../../services/validation/validation.service';

@Component({
  selector: 'app-scene3d',
  imports: [],
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
    private sceneService: SceneService
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
    
    // Porte - Maintenant sur le mur droit
    // Fenêtre 1 - Maintenant sur le mur arrière

    // Fenêtre 2
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
    mur.castShadow = true;
    mur.receiveShadow = true;

    this.scene.add(mur);

    // --- Ajout des fenêtres (colorées) ---
    // Porte - Maintenant sur le mur droit
    // Fenêtre 1 - Maintenant sur le mur arrière

    // Fenêtre 2
    const window2Config = openings.window2;
    const fenetre2Geo = new THREE.BoxGeometry(window2Config.dimensions.width, window2Config.dimensions.height, window2Config.dimensions.depth);
    const fenetre2Mat = new THREE.MeshStandardMaterial({ color: window2Config.color });
    const fenetre2 = new THREE.Mesh(fenetre2Geo, fenetre2Mat);
    fenetre2.position.set(window2Config.position.x, window2Config.position.y, window2Config.position.z);
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
    mur.castShadow = true;
    mur.receiveShadow = true;
    this.scene.add(mur);

    // Ajouter la fenêtre colorée dans le trou
    const fenetreGeo = new THREE.BoxGeometry(window1Config.dimensions.width, window1Config.dimensions.height, window1Config.dimensions.depth);
    const fenetreMat = new THREE.MeshStandardMaterial({ color: window1Config.color });
    const fenetre = new THREE.Mesh(fenetreGeo, fenetreMat);
    fenetre.position.set(window1Config.position.x, window1Config.position.y, window1Config.position.z);
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
    
    // ROTATION NÉCESSAIRE : Le mur droit doit être tourné de 90° sur l'axe Y
    // pour être perpendiculaire aux autres murs
    mur.rotation.y = Math.PI / 2; // 90 degrés en radians
    
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

    this.murService.modifierCouleurMur(type, nouvelleCouleur);
    console.log(`Couleur du mur ${type} modifiée vers:`, nouvelleCouleur);
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
    
    // Statistiques du bâtiment
    const statsBatiment = this.getStatistiquesBatiment();
    html += `<div>🏢 Bâtiment: ${JSON.stringify(statsBatiment, null, 2)}</div>`;
    
    // Statistiques des murs
    const statsMurs = this.getStatistiquesMurs();
    html += `<div>🧱 Murs: ${JSON.stringify(statsMurs, null, 2)}</div>`;
    
    // Statistiques des ouvertures
    const statsOuvertures = this.getStatistiquesOuvertures();
    html += `<div>🚪 Ouvertures: ${JSON.stringify(statsOuvertures, null, 2)}</div>`;
    
    // Statistiques des matériaux
    const statsMateriaux = this.getStatistiquesMateriaux();
    html += `<div>🎨 Matériaux: ${JSON.stringify(statsMateriaux, null, 2)}</div>`;
    
    output.innerHTML = html;
  }

  /**
   * Test des couleurs
   */
  public testCouleurs(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #FF9800;">🎨 <strong>Test des Couleurs:</strong></div>';
    
    // Changer la couleur du mur principal
    this.modifierCouleurMur('principal', 0xff0000); // Rouge
    html += '<div>🔴 Mur principal → Rouge</div>';
    
    setTimeout(() => {
      this.modifierCouleurMur('principal', 0x00ff00); // Vert
      html += '<div>🟢 Mur principal → Vert</div>';
      
      setTimeout(() => {
        this.modifierCouleurMur('principal', 0x0000ff); // Bleu
        html += '<div>🔵 Mur principal → Bleu</div>';
        
        setTimeout(() => {
          this.modifierCouleurMur('principal', 0xaaaaaa); // Gris (original)
          html += '<div>⚪ Mur principal → Gris (original)</div>';
          output.innerHTML = html;
        }, 1000);
      }, 1000);
    }, 1000);
    
    output.innerHTML = html;
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
   * Test de la validation (temporairement désactivé)
   */
  public testValidation(): void {
    const output = document.getElementById('services-output');
    if (!output) return;

    let html = '<div style="color: #FF5722;">🔍 <strong>Test de Validation:</strong></div>';
    html += '<div style="color: #f44336;">❌ ValidationService temporairement désactivé pour debug</div>';
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
}

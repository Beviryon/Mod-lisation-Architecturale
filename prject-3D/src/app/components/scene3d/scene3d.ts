import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
// Temporairement commentés pour debug
// import { CommunicationService } from '../../services/communication/communication.service';
// import { ValidationService } from '../../services/validation/validation.service';

@Component({
  selector: 'app-scene3d',
  imports: [FormsModule],
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
      // Synchroniser les données avec building-config.ts au démarrage
      this.synchroniserDonneesAuDemarrage();
      
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
    mur.name = 'murPrincipal'; // Nom pour la mise à jour des couleurs
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
    
    // ROTATION NÉCESSAIRE : Le mur droit doit être tourné de 90° sur l'axe Y
    // pour être perpendiculaire aux autres murs
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
      console.log(`✅ Couleur 3D mise à jour pour ${nomOuverture}:`, nouvelleCouleur);
    } else {
      console.log(`❌ Ouverture ${nomOuverture} non trouvée dans la scène 3D`);
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
          ouvertures: []
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
}

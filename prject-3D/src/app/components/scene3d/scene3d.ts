import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { BUILDING_CONFIG, WallCalculations } from '../../config/building-config';

@Component({
  selector: 'app-scene3d',
  imports: [],
  templateUrl: './scene3d.html',
  styleUrl: './scene3d.css'
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
    
    // Porte
    const porteHole = new THREE.Path();
    const doorHole = WallCalculations.getDoorHole(openings.door);
    porteHole.moveTo(doorHole[0].x, doorHole[0].y);
    for (let i = 1; i < doorHole.length; i++) {
      porteHole.lineTo(doorHole[i].x, doorHole[i].y);
    }
    murShape.holes.push(porteHole);

    // Fenêtre 1
    const fenetre1Hole = new THREE.Path();
    const window1Hole = WallCalculations.getWindowHole(openings.window1);
    fenetre1Hole.moveTo(window1Hole[0].x, window1Hole[0].y);
    for (let i = 1; i < window1Hole.length; i++) {
      fenetre1Hole.lineTo(window1Hole[i].x, window1Hole[i].y);
    }
    murShape.holes.push(fenetre1Hole);

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

    // --- Ajout des fenêtres et porte (colorées) ---
    // Porte
    const doorConfig = openings.door;
    const porteGeo = new THREE.BoxGeometry(doorConfig.dimensions.width, doorConfig.dimensions.height, doorConfig.dimensions.depth);
    const porteMat = new THREE.MeshStandardMaterial({ color: doorConfig.color });
    const porte = new THREE.Mesh(porteGeo, porteMat);
    porte.position.set(doorConfig.position.x, doorConfig.position.y, doorConfig.position.z);
    this.scene.add(porte);

    // Fenêtre 1
    const window1Config = openings.window1;
    const fenetre1Geo = new THREE.BoxGeometry(window1Config.dimensions.width, window1Config.dimensions.height, window1Config.dimensions.depth);
    const fenetre1Mat = new THREE.MeshStandardMaterial({ color: window1Config.color });
    const fenetre1 = new THREE.Mesh(fenetre1Geo, fenetre1Mat);
    fenetre1.position.set(window1Config.position.x, window1Config.position.y, window1Config.position.z);
    this.scene.add(fenetre1);

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

    // Mur arrière
    const backWall = walls.back;
    const murArriereGeo = new THREE.BoxGeometry(backWall.dimensions.width, backWall.dimensions.height, backWall.dimensions.depth);
    const murArriereMat = new THREE.MeshStandardMaterial({ color: backWall.color });
    const murArriere = new THREE.Mesh(murArriereGeo, murArriereMat);
    murArriere.position.set(backWall.position.x, backWall.position.y, backWall.position.z);
    murArriere.castShadow = true;
    murArriere.receiveShadow = true;
    this.scene.add(murArriere);

    // Mur gauche
    const leftWall = walls.left;
    const murGaucheGeo = new THREE.BoxGeometry(leftWall.dimensions.width, leftWall.dimensions.height, leftWall.dimensions.depth);
    const murGaucheMat = new THREE.MeshStandardMaterial({ color: leftWall.color });
    const murGauche = new THREE.Mesh(murGaucheGeo, murGaucheMat);
    murGauche.position.set(leftWall.position.x, leftWall.position.y, leftWall.position.z);
    murGauche.castShadow = true;
    murGauche.receiveShadow = true;
    this.scene.add(murGauche);

    // Mur droit
    const rightWall = walls.right;
    const murDroitGeo = new THREE.BoxGeometry(rightWall.dimensions.width, rightWall.dimensions.height, rightWall.dimensions.depth);
    const murDroitMat = new THREE.MeshStandardMaterial({ color: rightWall.color });
    const murDroit = new THREE.Mesh(murDroitGeo, murDroitMat);
    murDroit.position.set(rightWall.position.x, rightWall.position.y, rightWall.position.z);
    murDroit.castShadow = true;
    murDroit.receiveShadow = true;
    this.scene.add(murDroit);
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
}
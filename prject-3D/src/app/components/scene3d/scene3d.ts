import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

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

  // Contrôles de la souris
  private isMouseDown = false;
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = 0.3;
  private targetRotationY = 0.5;
  private rotationX = 0.3;
  private rotationY = 0.5;
  private targetZoom = 15;
  private zoom = 15;
  private targetPosition = new THREE.Vector3(0, 1.25, 0);

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
    this.scene.background = new THREE.Color(0xbfd1e5);

    this.camera = new THREE.PerspectiveCamera(
75,
      this.canvasContainer.nativeElement.clientWidth / this.canvasContainer.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 9);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);
  }



  private createMurPrincipalAvecOuverturesExtrude() {
    const murShape = new THREE.Shape();

    // Mur rectangulaire : largeur = 8m, hauteur = 2.5m
    murShape.moveTo(-4, 0);
    murShape.lineTo(4, 0);
    murShape.lineTo(4, 2.5);
    murShape.lineTo(-4, 2.5);
    murShape.lineTo(-4, 0);

    // --- Ouvertures ---
    // Porte (1m x 2.1m) centrée à x=-3
    const porteHole = new THREE.Path();
    porteHole.moveTo(-3 - 0.5, 0);
    porteHole.lineTo(-3 + 0.5, 0);
    porteHole.lineTo(-3 + 0.5, 2.1);
    porteHole.lineTo(-3 - 0.5, 2.1);
    porteHole.lineTo(-3 - 0.5, 0);
    murShape.holes.push(porteHole);

    // Fenêtre 1 (1.5m x 1.2m) centrée à x=-0.5
    const fenetre1Hole = new THREE.Path();
    fenetre1Hole.moveTo(-0.5 - 0.75, 0.9);
    fenetre1Hole.lineTo(-0.5 + 0.75, 0.9);
    fenetre1Hole.lineTo(-0.5 + 0.75, 2.1);                                                                                                                                                                                                                                                                   
    fenetre1Hole.lineTo(-0.5 - 0.75, 2.1);
    fenetre1Hole.lineTo(-0.5 - 0.75, 0.9);
    murShape.holes.push(fenetre1Hole);

    // Fenêtre 2 (2m x 1.2m) centrée à x=2.5
    const fenetre2Hole = new THREE.Path();
    fenetre2Hole.moveTo(2.5 - 1, 0.9);
    fenetre2Hole.lineTo(2.5 + 1, 0.9);
    fenetre2Hole.lineTo(2.5 + 1, 2.1);
    fenetre2Hole.lineTo(2.5 - 1, 2.1);
    fenetre2Hole.lineTo(2.5 - 1, 0.9);
    murShape.holes.push(fenetre2Hole);

    // Extrusion (épaisseur du mur = 0.2m)
    const extrudeSettings = { depth: 0.2, bevelEnabled: false };
    const murGeometry = new THREE.ExtrudeGeometry(murShape, extrudeSettings);
    const murMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const mur = new THREE.Mesh(murGeometry, murMat);

    mur.position.set(0, 0, 2.3);
    mur.castShadow = true;
    mur.receiveShadow = true;

    this.scene.add(mur);

    // --- Ajout des fenêtres et porte (colorées) ---
    const porteGeo = new THREE.BoxGeometry(1, 2.1, 0.05);
    const porteMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const porte = new THREE.Mesh(porteGeo, porteMat);
    porte.position.set(-3, 1.05, 2.3); // milieu de l'ouverture
    this.scene.add(porte);

    const fenetre1Geo = new THREE.BoxGeometry(1.5, 1.2, 0.05);
    const fenetreMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const fenetre1 = new THREE.Mesh(fenetre1Geo, fenetreMat);
    fenetre1.position.set(-0.5, 1.5, 2.3);
    this.scene.add(fenetre1);

    const fenetre2Geo = new THREE.BoxGeometry(2, 1.2, 0.05);
    const fenetre2 = new THREE.Mesh(fenetre2Geo, fenetreMat);
    fenetre2.position.set(2.5, 1.5, 2.3);
    this.scene.add(fenetre2);
  }

  private createAutresMurs() {
    const murMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

    // Mur arrière
    const murArriereGeo = new THREE.BoxGeometry(8, 2.5, 0.2);
    const murArriere = new THREE.Mesh(murArriereGeo, murMat);
    murArriere.position.set(0, 1.25, -2.4);
    murArriere.castShadow = true;
    murArriere.receiveShadow = true;
    this.scene.add(murArriere);

    // Mur gauche
    const murGaucheGeo = new THREE.BoxGeometry(0.2, 2.5, 5);
    const murGauche = new THREE.Mesh(murGaucheGeo, murMat);
    murGauche.position.set(-3.9, 1.25, 0);
    murGauche.castShadow = true;
    murGauche.receiveShadow = true;
    this.scene.add(murGauche);

    // Mur droit
    const murDroitGeo = new THREE.BoxGeometry(0.2, 2.5, 5);
    const murDroit = new THREE.Mesh(murDroitGeo, murMat);
    murDroit.position.set(3.9, 1.25, 0);
    murDroit.castShadow = true;
    murDroit.receiveShadow = true;
    this.scene.add(murDroit);
  }

  private createSol() {
    const solGeometry = new THREE.BoxGeometry(-8, 0.2, 5);
    const solMaterial = new THREE.MeshStandardMaterial({ color: 0x2E1E1A });
    const sol = new THREE.Mesh(solGeometry, solMaterial);
    sol.position.set(0, -0.1, 0);
    sol.receiveShadow = true;
    this.scene.add(sol);
  }

  private createToit() {
    const toitGeo = new THREE.BoxGeometry(8.4, 0.2, 5);
    const toitMat = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
    const toit = new THREE.Mesh(toitGeo, toitMat);
    toit.position.set(0, 2.6, 0);
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

    this.targetRotationY += deltaX * 0.01;
    this.targetRotationX += deltaY * 0.01;
    this.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotationX));

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private onMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
  }

  private onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    this.targetZoom += event.deltaY * 0.01;
    this.targetZoom = Math.max(5, Math.min(50, this.targetZoom));
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
    this.targetRotationX = 0.2;
    this.targetRotationY = 0.3;
    this.targetZoom = 15;
    
    this.updateCameraPosition();
    
    console.log('Position de la caméra réinitialisée');
  }

  private createRepere() {
    // Créer un répère avec les axes X, Y, Z
    const axesHelper = new THREE.AxesHelper(8);
    this.scene.add(axesHelper);

    // Ajouter des labels pour les axes
    this.createAxisLabels();
  }

  private createAxisLabels() {
    // Labels pour les axes (X, Y, Z)
    this.createSimpleLabel('X', 10, 0,0, 0xff0000); 
    this.createSimpleLabel('Y', 0, 10,0, 0x00ff00); 
    this.createSimpleLabel('Z', 0, 0, 10, 0x0000ff); 
  }

  private createSimpleLabel(text: string, x: number, y: number, z: number, color: number) {
    // Créer un petit cube coloré comme label
    const labelGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const labelMaterial = new THREE.MeshStandardMaterial({ color: color });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(x, y, z);
    this.scene.add(label);
  }
}
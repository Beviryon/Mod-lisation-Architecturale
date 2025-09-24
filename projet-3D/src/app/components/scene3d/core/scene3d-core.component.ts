import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID, Input, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import * as THREE from 'three';
import { BUILDING_CONFIG, WallCalculations } from '../../../config/building-config';

/**
 * Composant core pour la gestion de la scène Three.js
 * Responsable de l'initialisation, du rendu et de la navigation 3D
 */
@Component({
  selector: 'app-scene3d-core',
  imports: [CommonModule],
  templateUrl: './scene3d-core.component.html',
  styleUrl: './scene3d-core.component.css',
  standalone: true
})
export class Scene3dCoreComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  @Input() showAxes: boolean = true;
  @Input() showGrid: boolean = false;
  @Output() sceneReady = new EventEmitter<THREE.Scene>();
  @Output() cameraReady = new EventEmitter<THREE.PerspectiveCamera>();
  @Output() rendererReady = new EventEmitter<THREE.WebGLRenderer>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private controls: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJS();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    // Initialisation de la scène
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Initialisation de la caméra
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvasContainer.nativeElement.clientWidth / this.canvasContainer.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 8, 10);
    this.camera.lookAt(0, 0, 0);

    // Initialisation du renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.canvasContainer.nativeElement.clientWidth,
      this.canvasContainer.nativeElement.clientHeight
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Ajout du canvas au DOM
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    // Configuration de l'éclairage
    this.setupLighting();

    // Ajout des axes si demandé
    if (this.showAxes) {
      this.addAxes();
    }

    // Ajout de la grille si demandé
    if (this.showGrid) {
      this.addGrid();
    }

    // Configuration des contrôles de caméra
    this.setupControls();

    // Émission des événements
    this.sceneReady.emit(this.scene);
    this.cameraReady.emit(this.camera);
    this.rendererReady.emit(this.renderer);

    // Démarrage de la boucle de rendu
    this.animate();
  }

  private setupLighting(): void {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Lumière directionnelle (soleil)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
  }

  private addAxes(): void {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private addGrid(): void {
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
  }

  private setupControls(): void {
    // Contrôles de caméra simples (souris)
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        // Rotation de la caméra
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // Zoom avec la molette
    this.renderer.domElement.addEventListener('wheel', (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(scale);
    });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  // Méthodes publiques pour l'interaction avec le composant parent
  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public resetCamera(): void {
    this.camera.position.set(10, 8, 10);
    this.camera.lookAt(0, 0, 0);
  }

  public addObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public clearScene(): void {
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child instanceof THREE.AxesHelper || child instanceof THREE.GridHelper) {
        // Garder les helpers
        break;
      }
      this.scene.remove(child);
    }
  }
}

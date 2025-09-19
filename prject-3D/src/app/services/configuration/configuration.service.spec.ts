import { TestBed } from '@angular/core/testing';
import { ConfigurationService, ConfigurationBatiment } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default configuration', () => {
    const config = service.getConfiguration();
    expect(config).toBeDefined();
    expect(config.nom).toBe('Bâtiment Principal');
    expect(config.dimensions.longueur).toBe(8);
    expect(config.dimensions.largeur).toBe(5);
    expect(config.dimensions.hauteur).toBe(2.5);
  });

  it('should update configuration', () => {
    const nouvelleConfig: ConfigurationBatiment = {
      nom: 'Test Building',
      description: 'Test Description',
      dimensions: { longueur: 10, largeur: 6, hauteur: 3 },
      murs: {
        principal: {
          position: { x: 0, y: 0, z: 3 },
          dimensions: { width: 10, height: 3, depth: 0.2 },
          couleur: 0xaaaaaa,
          epaisseur: 0.2,
          ouvertures: []
        },
        arriere: {
          position: { x: 0, y: 0, z: -3 },
          dimensions: { width: 10, height: 3, depth: 0.2 },
          couleur: 0xaaaaaa,
          epaisseur: 0.2,
          ouvertures: []
        },
        gauche: {
          position: { x: -4.9, y: 1.5, z: 0 },
          dimensions: { width: 0.2, height: 3, depth: 6 },
          couleur: 0xaaaaaa,
          epaisseur: 0.2,
          ouvertures: []
        },
        droit: {
          position: { x: 4.8, y: 0, z: 0 },
          dimensions: { width: 0.2, height: 3, depth: 6 },
          couleur: 0xaaaaaa,
          epaisseur: 0.2,
          ouvertures: []
        }
      },
      toit: {
        position: { x: 0, y: 3.1, z: 0 },
        dimensions: { width: 10.4, height: 0.2, depth: 6 },
        couleur: 0x4169e1
      },
      sol: {
        position: { x: 0, y: -0.1, z: 0 },
        dimensions: { width: 10.2, height: 0.2, depth: 6.2 },
        couleur: 0x8b4513
      }
    };

    service.mettreAJourConfiguration(nouvelleConfig);
    const config = service.getConfiguration();
    
    expect(config.nom).toBe('Test Building');
    expect(config.dimensions.longueur).toBe(10);
  });

  it('should validate configuration', () => {
    const invalidConfig = {
      nom: '',
      dimensions: { longueur: -1, largeur: 0, hauteur: 0 }
    } as any;

    expect(() => {
      service.mettreAJourConfiguration(invalidConfig);
    }).toThrow();
  });

  it('should get dimensions', () => {
    const dimensions = service.getDimensionsBatiment();
    expect(dimensions).toBeDefined();
    expect(dimensions.longueur).toBe(8);
    expect(dimensions.largeur).toBe(5);
    expect(dimensions.hauteur).toBe(2.5);
  });

  it('should get walls', () => {
    const murs = service.getMurs();
    expect(murs).toBeDefined();
    expect(murs.principal).toBeDefined();
    expect(murs.arriere).toBeDefined();
    expect(murs.gauche).toBeDefined();
    expect(murs.droit).toBeDefined();
  });

  it('should get all openings', () => {
    const ouvertures = service.getAllOuvertures();
    expect(Array.isArray(ouvertures)).toBe(true);
    expect(ouvertures.length).toBeGreaterThan(0);
  });

  it('should reset configuration', () => {
    const configAvant = service.getConfiguration();
    service.mettreAJourConfiguration({
      ...configAvant,
      nom: 'Modified Name'
    });
    
    service.reinitialiserConfiguration();
    const configApres = service.getConfiguration();
    
    expect(configApres.nom).toBe('Bâtiment Principal');
  });
});

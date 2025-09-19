/**
 * Script de test pour les services Angular
 * Ce fichier peut être exécuté dans la console du navigateur
 */

// Interface pour les tests
interface TestResult {
  service: string;
  method: string;
  success: boolean;
  message: string;
  data?: any;
}

class ServiceTester {
  private results: TestResult[] = [];

  constructor() {
    console.log('🧪 ServiceTester initialisé');
  }

  /**
   * Test du ConfigurationService
   */
  testConfigurationService(configService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir la configuration
      const config = configService.getConfiguration();
      tests.push({
        service: 'ConfigurationService',
        method: 'getConfiguration',
        success: !!config,
        message: config ? 'Configuration récupérée' : 'Échec de récupération',
        data: config
      });

      // Test 2: Mettre à jour la configuration
      const nouvelleConfig = { ...config, nom: 'Test Building' };
      configService.mettreAJourConfiguration(nouvelleConfig);
      tests.push({
        service: 'ConfigurationService',
        method: 'mettreAJourConfiguration',
        success: true,
        message: 'Configuration mise à jour',
        data: nouvelleConfig
      });

      // Test 3: Obtenir les dimensions
      const dimensions = configService.getDimensionsBatiment();
      tests.push({
        service: 'ConfigurationService',
        method: 'getDimensionsBatiment',
        success: !!dimensions,
        message: dimensions ? 'Dimensions récupérées' : 'Échec de récupération',
        data: dimensions
      });

    } catch (error) {
      tests.push({
        service: 'ConfigurationService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Test du BatimentService
   */
  testBatimentService(batimentService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir les propriétés
      const proprietes = batimentService.getProprietes();
      tests.push({
        service: 'BatimentService',
        method: 'getProprietes',
        success: !!proprietes,
        message: proprietes ? 'Propriétés récupérées' : 'Échec de récupération',
        data: proprietes
      });

      // Test 2: Obtenir les statistiques
      const stats = batimentService.getStatistiques();
      tests.push({
        service: 'BatimentService',
        method: 'getStatistiques',
        success: !!stats,
        message: stats ? 'Statistiques calculées' : 'Échec de calcul',
        data: stats
      });

      // Test 3: Changer le nom
      batimentService.changerNom('Bâtiment Test');
      tests.push({
        service: 'BatimentService',
        method: 'changerNom',
        success: true,
        message: 'Nom changé avec succès'
      });

      // Test 4: Export des données
      const exportData = batimentService.exporterDonnees();
      tests.push({
        service: 'BatimentService',
        method: 'exporterDonnees',
        success: !!exportData,
        message: exportData ? 'Données exportées' : 'Échec d\'export',
        data: JSON.parse(exportData)
      });

    } catch (error) {
      tests.push({
        service: 'BatimentService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Test du MurService
   */
  testMurService(murService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir tous les murs
      const murs = murService.getMurs();
      tests.push({
        service: 'MurService',
        method: 'getMurs',
        success: Array.isArray(murs) && murs.length > 0,
        message: `Murs récupérés: ${murs.length}`,
        data: murs
      });

      // Test 2: Obtenir le mur principal
      const murPrincipal = murService.getMurPrincipal();
      tests.push({
        service: 'MurService',
        method: 'getMurPrincipal',
        success: !!murPrincipal,
        message: murPrincipal ? 'Mur principal trouvé' : 'Mur principal non trouvé',
        data: murPrincipal
      });

      // Test 3: Statistiques des murs
      const statsMurs = murService.getStatistiquesMurs();
      tests.push({
        service: 'MurService',
        method: 'getStatistiquesMurs',
        success: !!statsMurs,
        message: statsMurs ? 'Statistiques calculées' : 'Échec de calcul',
        data: statsMurs
      });

      // Test 4: Modifier la couleur d'un mur
      murService.modifierCouleurMur('principal', 0xff0000);
      tests.push({
        service: 'MurService',
        method: 'modifierCouleurMur',
        success: true,
        message: 'Couleur du mur modifiée'
      });

    } catch (error) {
      tests.push({
        service: 'MurService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Test du OuvertureService
   */
  testOuvertureService(ouvertureService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir toutes les ouvertures
      const ouvertures = ouvertureService.getOuvertures();
      tests.push({
        service: 'OuvertureService',
        method: 'getOuvertures',
        success: Array.isArray(ouvertures),
        message: `Ouvertures récupérées: ${ouvertures.length}`,
        data: ouvertures
      });

      // Test 2: Obtenir les portes
      const portes = ouvertureService.getPortes();
      tests.push({
        service: 'OuvertureService',
        method: 'getPortes',
        success: Array.isArray(portes),
        message: `Portes trouvées: ${portes.length}`,
        data: portes
      });

      // Test 3: Obtenir les fenêtres
      const fenetres = ouvertureService.getFenetres();
      tests.push({
        service: 'OuvertureService',
        method: 'getFenetres',
        success: Array.isArray(fenetres),
        message: `Fenêtres trouvées: ${fenetres.length}`,
        data: fenetres
      });

      // Test 4: Statistiques des ouvertures
      const statsOuvertures = ouvertureService.getStatistiquesOuvertures();
      tests.push({
        service: 'OuvertureService',
        method: 'getStatistiquesOuvertures',
        success: !!statsOuvertures,
        message: statsOuvertures ? 'Statistiques calculées' : 'Échec de calcul',
        data: statsOuvertures
      });

    } catch (error) {
      tests.push({
        service: 'OuvertureService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Test du MateriauService
   */
  testMateriauService(materiauService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir tous les matériaux
      const materiaux = materiauService.getMateriaux();
      tests.push({
        service: 'MateriauService',
        method: 'getMateriaux',
        success: Array.isArray(materiaux) && materiaux.length > 0,
        message: `Matériaux récupérés: ${materiaux.length}`,
        data: materiaux
      });

      // Test 2: Obtenir les palettes
      const palettes = materiauService.getPalettes();
      tests.push({
        service: 'MateriauService',
        method: 'getPalettes',
        success: Array.isArray(palettes),
        message: `Palettes récupérées: ${palettes.length}`,
        data: palettes
      });

      // Test 3: Générer une couleur aléatoire
      const couleurAleatoire = materiauService.genererCouleurAleatoire();
      tests.push({
        service: 'MateriauService',
        method: 'genererCouleurAleatoire',
        success: typeof couleurAleatoire === 'number' && couleurAleatoire >= 0,
        message: `Couleur générée: #${couleurAleatoire.toString(16)}`,
        data: couleurAleatoire
      });

      // Test 4: Statistiques des matériaux
      const statsMateriaux = materiauService.getStatistiquesMateriaux();
      tests.push({
        service: 'MateriauService',
        method: 'getStatistiquesMateriaux',
        success: !!statsMateriaux,
        message: statsMateriaux ? 'Statistiques calculées' : 'Échec de calcul',
        data: statsMateriaux
      });

    } catch (error) {
      tests.push({
        service: 'MateriauService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Test du SceneService
   */
  testSceneService(sceneService: any): TestResult[] {
    const tests: TestResult[] = [];

    try {
      // Test 1: Obtenir les propriétés de la scène
      const proprietesScene = sceneService.getProprietesScene();
      tests.push({
        service: 'SceneService',
        method: 'getProprietesScene',
        success: !!proprietesScene,
        message: proprietesScene ? 'Propriétés récupérées' : 'Échec de récupération',
        data: proprietesScene
      });

      // Test 2: Obtenir les propriétés de la caméra
      const proprietesCamera = sceneService.getProprietesCamera();
      tests.push({
        service: 'SceneService',
        method: 'getProprietesCamera',
        success: !!proprietesCamera,
        message: proprietesCamera ? 'Propriétés caméra récupérées' : 'Échec de récupération',
        data: proprietesCamera
      });

      // Test 3: Obtenir les lumières
      const lumieres = sceneService.getLumieres();
      tests.push({
        service: 'SceneService',
        method: 'getLumieres',
        success: Array.isArray(lumieres),
        message: `Lumières récupérées: ${lumieres.length}`,
        data: lumieres
      });

      // Test 4: Statistiques de la scène
      const statsScene = sceneService.getStatistiquesScene();
      tests.push({
        service: 'SceneService',
        method: 'getStatistiquesScene',
        success: !!statsScene,
        message: statsScene ? 'Statistiques calculées' : 'Échec de calcul',
        data: statsScene
      });

    } catch (error) {
      tests.push({
        service: 'SceneService',
        method: 'testGeneral',
        success: false,
        message: `Erreur: ${error}`,
        data: error
      });
    }

    return tests;
  }

  /**
   * Exécuter tous les tests
   */
  runAllTests(services: any): void {
    console.log('🚀 Démarrage des tests complets...');
    
    this.results = [];

    // Tests ConfigurationService
    this.results.push(...this.testConfigurationService(services.configurationService));

    // Tests BatimentService
    this.results.push(...this.testBatimentService(services.batimentService));

    // Tests MurService
    this.results.push(...this.testMurService(services.murService));

    // Tests OuvertureService
    this.results.push(...this.testOuvertureService(services.ouvertureService));

    // Tests MateriauService
    this.results.push(...this.testMateriauService(services.materiauService));

    // Tests SceneService
    this.results.push(...this.testSceneService(services.sceneService));

    this.displayResults();
  }

  /**
   * Afficher les résultats des tests
   */
  displayResults(): void {
    console.log('\n📊 RÉSULTATS DES TESTS:');
    console.log('='.repeat(50));

    const successCount = this.results.filter(r => r.success).length;
    const totalCount = this.results.length;

    console.log(`✅ Tests réussis: ${successCount}/${totalCount}`);
    console.log(`❌ Tests échoués: ${totalCount - successCount}/${totalCount}`);
    console.log('');

    // Grouper par service
    const services = [...new Set(this.results.map(r => r.service))];
    
    services.forEach(service => {
      console.log(`\n🔧 ${service}:`);
      const serviceResults = this.results.filter(r => r.service === service);
      
      serviceResults.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`  ${icon} ${result.method}: ${result.message}`);
        
        if (result.data && !result.success) {
          console.log(`     Erreur: ${result.data}`);
        }
      });
    });

    console.log('\n🎯 Test terminé!');
  }
}

// Fonction globale pour exécuter les tests
function testAllServices(): void {
  // Récupérer les services depuis le composant Angular
  const sceneComponent = (window as any).sceneComponent;
  
  if (!sceneComponent) {
    console.error('❌ Composant Scene3d non trouvé. Assurez-vous que l\'application est chargée.');
    return;
  }

  const services = {
    configurationService: sceneComponent.configurationService,
    batimentService: sceneComponent.batimentService,
    murService: sceneComponent.murService,
    ouvertureService: sceneComponent.ouvertureService,
    materiauService: sceneComponent.materiauService,
    sceneService: sceneComponent.sceneService
  };

  const tester = new ServiceTester();
  tester.runAllTests(services);
}

// Exporter pour utilisation globale
(window as any).testAllServices = testAllServices;
(window as any).ServiceTester = ServiceTester;

console.log('🧪 ServiceTester chargé! Utilisez testAllServices() pour lancer les tests.');

'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">projet-3-d documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/CalculateurFenetresComponent.html" data-type="entity-link" >CalculateurFenetresComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColorSelectorComponent.html" data-type="entity-link" >ColorSelectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DimensionsControllerComponent.html" data-type="entity-link" >DimensionsControllerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FenetresCalculatorComponent.html" data-type="entity-link" >FenetresCalculatorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MursControllerComponent.html" data-type="entity-link" >MursControllerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OuverturesControllerComponent.html" data-type="entity-link" >OuverturesControllerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Scene3d.html" data-type="entity-link" >Scene3d</a>
                            </li>
                            <li class="link">
                                <a href="components/Scene3dCoreComponent.html" data-type="entity-link" >Scene3dCoreComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Scene3dRefactored.html" data-type="entity-link" >Scene3dRefactored</a>
                            </li>
                            <li class="link">
                                <a href="components/StructureControllerComponent.html" data-type="entity-link" >StructureControllerComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/WallCalculations.html" data-type="entity-link" >WallCalculations</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BatimentService.html" data-type="entity-link" >BatimentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CalculateurFenetresService.html" data-type="entity-link" >CalculateurFenetresService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CommunicationService.html" data-type="entity-link" >CommunicationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigDirectService.html" data-type="entity-link" >ConfigDirectService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigurationService.html" data-type="entity-link" >ConfigurationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MateriauService.html" data-type="entity-link" >MateriauService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MurService.html" data-type="entity-link" >MurService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OuvertureService.html" data-type="entity-link" >OuvertureService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SceneService.html" data-type="entity-link" >SceneService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ValidationService.html" data-type="entity-link" >ValidationService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CalculFenetres.html" data-type="entity-link" >CalculFenetres</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalculsMur.html" data-type="entity-link" >CalculsMur</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalculsOuverture.html" data-type="entity-link" >CalculsOuverture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraConfig.html" data-type="entity-link" >CameraConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColorableElement.html" data-type="entity-link" >ColorableElement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommunicationEvent.html" data-type="entity-link" >CommunicationEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommunicationStats.html" data-type="entity-link" >CommunicationStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationBatiment.html" data-type="entity-link" >ConfigurationBatiment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationComplete.html" data-type="entity-link" >ConfigurationComplete</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationMur.html" data-type="entity-link" >ConfigurationMur</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationOuverture.html" data-type="entity-link" >ConfigurationOuverture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationSol.html" data-type="entity-link" >ConfigurationSol</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationToit.html" data-type="entity-link" >ConfigurationToit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ControlesScene.html" data-type="entity-link" >ControlesScene</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Dimensions.html" data-type="entity-link" >Dimensions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Dimensions3D.html" data-type="entity-link" >Dimensions3D</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FenetreConfig.html" data-type="entity-link" >FenetreConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FenetresParams.html" data-type="entity-link" >FenetresParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LightingConfig.html" data-type="entity-link" >LightingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MainWallConfig.html" data-type="entity-link" >MainWallConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Mur.html" data-type="entity-link" >Mur</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MurConfig.html" data-type="entity-link" >MurConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OpeningConfig.html" data-type="entity-link" >OpeningConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Ouverture.html" data-type="entity-link" >Ouverture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaletteCouleurs.html" data-type="entity-link" >PaletteCouleurs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Position3D.html" data-type="entity-link" >Position3D</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesBatiment.html" data-type="entity-link" >ProprietesBatiment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesCamera.html" data-type="entity-link" >ProprietesCamera</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesLumiere.html" data-type="entity-link" >ProprietesLumiere</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesMateriau.html" data-type="entity-link" >ProprietesMateriau</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesMur.html" data-type="entity-link" >ProprietesMur</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesOuverture.html" data-type="entity-link" >ProprietesOuverture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesScene.html" data-type="entity-link" >ProprietesScene</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProprietesTexture.html" data-type="entity-link" >ProprietesTexture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SceneConfig.html" data-type="entity-link" >SceneConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServiceMessage.html" data-type="entity-link" >ServiceMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatistiquesBatiment.html" data-type="entity-link" >StatistiquesBatiment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatistiquesMateriaux.html" data-type="entity-link" >StatistiquesMateriaux</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatistiquesOuvertures.html" data-type="entity-link" >StatistiquesOuvertures</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatistiquesScene.html" data-type="entity-link" >StatistiquesScene</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Structure.html" data-type="entity-link" >Structure</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StructureDimensions.html" data-type="entity-link" >StructureDimensions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationError.html" data-type="entity-link" >ValidationError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationMur.html" data-type="entity-link" >ValidationMur</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationOuverture.html" data-type="entity-link" >ValidationOuverture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationResult.html" data-type="entity-link" >ValidationResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationRule.html" data-type="entity-link" >ValidationRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationStats.html" data-type="entity-link" >ValidationStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationWarning.html" data-type="entity-link" >ValidationWarning</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WallConfig.html" data-type="entity-link" >WallConfig</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
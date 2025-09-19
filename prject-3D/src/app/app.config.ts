import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Import des services
import { ConfigurationService } from './services/configuration/configuration.service';
import { BatimentService } from './services/batiment/batiment.service';
import { MurService } from './services/mur/mur.service';
import { OuvertureService } from './services/ouverture/ouverture.service';
import { MateriauService } from './services/materiau/materiau.service';
import { SceneService } from './services/scene/scene.service';
// Temporairement commentés pour debug
// import { CommunicationService } from './services/communication/communication.service';
// import { ValidationService } from './services/validation/validation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    // Services
    ConfigurationService,
    BatimentService,
    MurService,
    OuvertureService,
    MateriauService,
    SceneService
    // Temporairement commentés pour debug
    // CommunicationService,
    // ValidationService
  ]
};

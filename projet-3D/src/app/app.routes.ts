import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/scene3d/scene3d').then(m => m.Scene3d)
  },
  {
    path: 'calculateur',
    loadComponent: () => import('./components/calculateur-fenetres/calculateur-fenetres.component').then(m => m.CalculateurFenetresComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

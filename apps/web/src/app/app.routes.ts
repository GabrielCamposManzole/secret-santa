import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'perfil',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  }
];

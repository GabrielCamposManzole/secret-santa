import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  // Guest Routes
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/cadastro/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: 'recuperar-senha',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/recuperar-senha/recuperar-senha.component').then(
        (m) => m.RecuperarSenhaComponent,
      ),
  },
  {
    path: 'email-enviado',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/email-enviado/email-enviado.component').then(
        (m) => m.EmailEnviadoComponent,
      ),
  },
  // Authenticated Routes
  {
    path: 'sorteios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'sorteios/criar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/criar/criar.component').then((m) => m.CriarComponent),
  },
  {
    path: 'sorteios/editar/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/editar/editar.component').then((m) => m.EditarComponent),
  },
  {
    path: 'sorteio/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/detail/detail.component').then((m) => m.DetailComponent),
  },
  {
    path: 'convite/:token',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/invite/invite.component').then((m) => m.InviteComponent),
  },
  {
    path: 'sorteio/:id/jogo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio-resultado/pages/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'sorteio/:id/chute',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio-resultado/pages/chute/chute.component').then((m) => m.ChuteComponent),
  },
  {
    path: 'sorteio/:id/resultado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio-resultado/pages/reveal/reveal.component').then((m) => m.RevealComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  // Wildcard fallback
  {
    path: '**',
    redirectTo: 'sorteios',
  },
];
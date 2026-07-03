import { inject } from '@angular/core';
import { Routes, ResolveFn } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { GroupService } from './core/services/group.service';
import { Grupo, ParticipanteGrupo } from './core/models';

export const groupDetailsResolver: ResolveFn<{ group: Grupo; participants: ParticipanteGrupo[] } | null> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) return null;
  return inject(GroupService).getGroupDetails(id);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sorteio/pages/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: 'criar',
        loadComponent: () =>
          import('./features/sorteio/pages/criar/criar.component').then((m) => m.CriarComponent),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./features/sorteio/pages/editar/editar.component').then((m) => m.EditarComponent),
      },
    ],
  },
  {
    path: 'sorteio/:id',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        resolve: { groupDetails: groupDetailsResolver },
        loadComponent: () =>
          import('./features/sorteio/pages/detail/detail.component').then((m) => m.DetailComponent),
      },
      {
        path: 'jogo',
        loadComponent: () =>
          import('./features/sorteio-resultado/pages/game/game.component').then(
            (m) => m.GameComponent,
          ),
      },
      {
        path: 'chute',
        loadComponent: () =>
          import('./features/sorteio-resultado/pages/chute/chute.component').then(
            (m) => m.ChuteComponent,
          ),
      },
      {
        path: 'resultado',
        loadComponent: () =>
          import('./features/sorteio-resultado/pages/reveal/reveal.component').then(
            (m) => m.RevealComponent,
          ),
      },
    ],
  },
  {
    path: 'convite/:token',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sorteio/pages/invite/invite.component').then((m) => m.InviteComponent),
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

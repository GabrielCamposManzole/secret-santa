import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  private readonly router = inject(Router);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly isHome = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '/home';
  });

  readonly isGrupos = computed(() => {
    const url = this.currentUrl();
    return (
      url.startsWith('/sorteio') &&
      !url.includes('/jogo') &&
      !url.includes('/chute') &&
      !url.includes('/resultado')
    );
  });

  readonly isPerfil = computed(() => this.currentUrl().startsWith('/perfil'));

  readonly homeIconSettings = computed(() => (this.isHome() ? "'FILL' 1" : "'FILL' 0"));
  readonly gruposIconSettings = computed(() => (this.isGrupos() ? "'FILL' 1" : "'FILL' 0"));
  readonly perfilIconSettings = computed(() => (this.isPerfil() ? "'FILL' 1" : "'FILL' 0"));
}

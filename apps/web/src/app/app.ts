import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
})
export class App {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: '/' },
  );

  readonly isLandingPage = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '/home';
  });

  readonly isAuthPage = computed(() => {
    const url = this.currentUrl();
    return (
      url.startsWith('/login') ||
      url.startsWith('/cadastro') ||
      url.startsWith('/recuperar-senha') ||
      url.startsWith('/email-enviado')
    );
  });

  readonly isAppPage = computed(() => {
    return !this.isLandingPage() && !this.isAuthPage();
  });

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

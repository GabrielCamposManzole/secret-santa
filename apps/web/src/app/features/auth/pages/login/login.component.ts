import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  constructor() {
    effect(() => {
      const message = this.errorMessage();
      if (message) {
        console.warn(
          `%c[Auth Audit] Falha na tentativa de login: ${message}`,
          'color: #ffffff; background-color: #ef4444; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        );

        try {
          const currentLogs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
          currentLogs.push({
            timestamp: new Date().toLocaleString('pt-BR'),
            error: message,
          });
          localStorage.setItem('auth_logs', JSON.stringify(currentLogs));
        } catch (e) {
          console.error('Erro ao salvar auditoria no localStorage:', e);
        }
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { error } = await this.authService.login(this.email(), this.password());

    this.isLoading.set(false);

    if (error) {
      this.errorMessage.set(error.message || 'Erro ao realizar login.');
    } else {
      this.router.navigate(['/sorteios']);
    }
  }
}

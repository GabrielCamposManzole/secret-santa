import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-senha.component.html',
})
export class RecuperarSenhaComponent {
  private readonly router = inject(Router);
  private readonly emailService = inject(EmailService);

  readonly email = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  onSubmit(): void {
    if (!this.email()) {
      this.errorMessage.set('Por favor, preencha o campo de e-mail.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.emailService.sendPasswordRecovery(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/email-enviado']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Não foi possível enviar o e-mail. Tente novamente.');
      },
    });
  }
}

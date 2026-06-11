import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-senha.component.html',
})
export class RecuperarSenhaComponent {
  private readonly router = inject(Router);

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

    // Simulate sending recovery email
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/email-enviado']);
    }, 1000);
  }
}
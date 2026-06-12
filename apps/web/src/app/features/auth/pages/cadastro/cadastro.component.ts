import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly nomeCompleto = signal('');
  readonly idade = signal<number | null>(null);
  readonly email = signal('');
  readonly senha = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  onSubmit(): void {
    if (!this.nomeCompleto() || !this.email() || !this.senha() || this.idade() === null) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const newUserData = {
      nome_completo: this.nomeCompleto(),
      idade: Number(this.idade()),
      email: this.email(),
      senha: this.senha(),
      cabelo_cor: '',
      cabelo_tipo: '',
      cabelo_comprimento: '',
      olhos_cor: '',
      altura: 170, // default height in cm
    };

    this.authService.register(newUserData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/sorteios']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao criar conta.');
      },
    });
  }
}

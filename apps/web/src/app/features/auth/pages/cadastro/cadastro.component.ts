import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  private readonly authService = inject(AuthService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly cadastroForm: FormGroup = this.fb.group({
    nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
    idade: [null, [Validators.required, Validators.min(18)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  async onSubmit(): Promise<void> {
    if (this.cadastroForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos corretamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, senha, nomeCompleto } = this.cadastroForm.value;

    try {
      const { error } = await this.authService.cadastrar(
        email,
        senha,
        nomeCompleto,
      );

      this.isLoading.set(false);

      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('registered')
        ) {
          this.errorMessage.set(
            'Este e-mail já está cadastrado no sistema. Tente fazer login.',
          );
        } else {
          this.errorMessage.set(error.message || 'Erro ao criar conta.');
        }
      } else {
        this.router.navigate(['/sorteios']);
      }
    } catch (e) {
      const errorObj = e as Error;
      this.isLoading.set(false);
      this.errorMessage.set(errorObj.message || 'Um erro inesperado ocorreu.');
    }
  }
}

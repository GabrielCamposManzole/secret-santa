import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MembershipService } from '../../core/services/membership.service';
import { SupabaseService } from '../../core/services/supabase';
import { of, switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly membershipService = inject(MembershipService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  // Profile fields
  readonly nomeCompleto = signal('');
  readonly email = signal('');
  readonly idade = signal<number | null>(null);

  // New password fields
  readonly novaSenha = signal('');
  readonly confirmarNovaSenha = signal('');
  readonly isUpdatingPassword = signal(false);
  readonly passwordSuccessMessage = signal<string | null>(null);
  readonly passwordErrorMessage = signal<string | null>(null);

  // Characteristics fields
  readonly cabeloCor = signal('');
  readonly cabeloTipo = signal('');
  readonly cabeloComprimento = signal('');
  readonly olhosCor = signal('');
  readonly altura = signal<number | null>(null);

  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      // Dados básicos do Supabase Auth
      this.email.set(user.email ?? '');
      // Metadados adicionais salvos no user_metadata
      const meta = user.user_metadata ?? {};
      this.nomeCompleto.set((meta['nome_completo'] as string) ?? '');
      this.idade.set((meta['idade'] as number) ?? null);
      this.cabeloCor.set((meta['cabelo_cor'] as string) ?? '');
      this.cabeloTipo.set((meta['cabelo_tipo'] as string) ?? '');
      this.cabeloComprimento.set((meta['cabelo_comprimento'] as string) ?? '');
      this.olhosCor.set((meta['olhos_cor'] as string) ?? '');
      this.altura.set((meta['altura'] as number) ?? null);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async onSave(): Promise<void> {
    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const hasCharacteristics = !!(
      this.cabeloCor().trim() &&
      this.cabeloTipo().trim() &&
      this.cabeloComprimento().trim() &&
      this.olhosCor().trim() &&
      this.altura() !== null
    );

    // Preparar objeto de atualização sem any
    const updatePayload: {
      data: {
        nome_completo: string;
        idade: number | null;
        cabelo_cor: string;
        cabelo_tipo: string;
        cabelo_comprimento: string;
        olhos_cor: string;
        altura: number | null;
      };
    } = {
      data: {
        nome_completo: this.nomeCompleto(),
        idade: this.idade(),
        cabelo_cor: this.cabeloCor(),
        cabelo_tipo: this.cabeloTipo(),
        cabelo_comprimento: this.cabeloComprimento(),
        olhos_cor: this.olhosCor(),
        altura: this.altura(),
      },
    };

    // Atualiza user_metadata no Supabase Auth
    const { error } = await this.supabaseService.client.auth.updateUser(updatePayload);

    if (error) {
      this.isLoading.set(false);
      this.errorMessage.set(error.message || 'Erro ao atualizar perfil.');
      return;
    }

    // Atualiza flag de características nos memberships do usuário
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.membershipService
        .getMemberships(userId)
        .pipe(
          switchMap((memberships) => {
            if (memberships.length === 0) return of(null);
            const updates = memberships.map((m) => {
              if (m.preenchido_caracteristicas === hasCharacteristics) return of(m);
              return this.membershipService.updateMembership(m.id, {
                preenchido_caracteristicas: hasCharacteristics,
              });
            });
            return updates.length > 0 ? forkJoin(updates) : of(null);
          }),
        )
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.successMessage.set('Perfil atualizado com sucesso!');
            setTimeout(() => this.successMessage.set(null), 3000);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.message || 'Erro ao atualizar memberships.');
          },
        });
    } else {
      this.isLoading.set(false);
      this.successMessage.set('Perfil atualizado com sucesso!');
      setTimeout(() => this.successMessage.set(null), 3000);
    }
  }

  async onUpdatePassword(): Promise<void> {
    const senhaLimpa = this.novaSenha().trim();
    const confirmacaoLimpa = this.confirmarNovaSenha().trim();

    if (!senhaLimpa) {
      this.passwordErrorMessage.set('A senha não pode ser vazia.');
      return;
    }

    if (senhaLimpa !== confirmacaoLimpa) {
      this.passwordErrorMessage.set('As senhas digitadas não coincidem.');
      return;
    }

    if (senhaLimpa.length < 6) {
      this.passwordErrorMessage.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.isUpdatingPassword.set(true);
    this.passwordSuccessMessage.set(null);
    this.passwordErrorMessage.set(null);

    // Atualiza a senha nova direto no banco de dados (Supabase Auth)
    const { error } = await this.supabaseService.client.auth.updateUser({
      password: senhaLimpa,
    });

    this.isUpdatingPassword.set(false);

    if (error) {
      this.passwordErrorMessage.set(error.message || 'Erro ao atualizar a senha.');
    } else {
      this.passwordSuccessMessage.set('Senha alterada direto no banco com sucesso!');
      this.novaSenha.set('');
      this.confirmarNovaSenha.set('');
      setTimeout(() => this.passwordSuccessMessage.set(null), 3000);
    }
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}

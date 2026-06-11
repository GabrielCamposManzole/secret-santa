import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Usuario, UsuarioGrupo } from '../../core/models';
import { environment } from '../../../environments/environment';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Profile fields
  readonly nomeCompleto = signal('');
  readonly email = signal('');
  readonly idade = signal<number | null>(null);

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
      this.nomeCompleto.set(user.nome_completo || '');
      this.email.set(user.email || '');
      this.idade.set(user.idade ?? null);
      this.cabeloCor.set(user.cabelo_cor || '');
      this.cabeloTipo.set(user.cabelo_tipo || '');
      this.cabeloComprimento.set(user.cabelo_comprimento || '');
      this.olhosCor.set(user.olhos_cor || '');
      this.altura.set(user.altura ?? null);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSave(): void {
    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const updatedUser: Partial<Usuario> = {
      nome_completo: this.nomeCompleto(),
      email: this.email(),
      idade: this.idade() !== null ? Number(this.idade()) : undefined,
      cabelo_cor: this.cabeloCor(),
      cabelo_tipo: this.cabeloTipo(),
      cabelo_comprimento: this.cabeloComprimento(),
      olhos_cor: this.olhosCor(),
      altura: this.altura() !== null ? Number(this.altura()) : undefined,
    };

    // Determine if all characteristics are filled
    const hasCharacteristics = !!(
      this.cabeloCor().trim() &&
      this.cabeloTipo().trim() &&
      this.cabeloComprimento().trim() &&
      this.olhosCor().trim() &&
      this.altura() !== null
    );

    this.authService.updateProfile(updatedUser).pipe(
      switchMap(() => {
        const userId = this.authService.getCurrentUserId();
        if (!userId) return of(null);

        // Fetch user memberships and update preenchido_caracteristicas
        return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo?usuario_id=${userId}`).pipe(
          switchMap((memberships) => {
            if (memberships.length === 0) return of(null);
            
            const updates = memberships.map((m) => {
              if (m.preenchido_caracteristicas === hasCharacteristics) return of(m);
              return this.http.patch<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo/${m.id}`, {
                preenchido_caracteristicas: hasCharacteristics,
              });
            });
            return forkJoin(updates);
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Perfil atualizado com sucesso!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao atualizar perfil.');
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
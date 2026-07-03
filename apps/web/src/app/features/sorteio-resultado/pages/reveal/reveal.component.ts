import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { MembershipService } from '../../../../core/services/membership.service';
import { SupabaseService } from '../../../../core/services/supabase';
import { Usuario, UsuarioGrupo, Grupo } from '../../../../core/models';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'app-reveal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reveal.component.html',
})
export class RevealComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly membershipService = inject(MembershipService);
  private readonly supabaseService = inject(SupabaseService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any {
    return this.supabaseService.client;
  }

  readonly id = input<string>(); // Vinculação automática do parâmetro :id da URL
  readonly groupId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly targetUser = signal<Usuario | null>(null);
  readonly guessUser = signal<Usuario | null>(null);
  readonly membership = signal<UsuarioGrupo | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.router.navigate(['/sorteios']);
      return;
    }
    this.groupId.set(id);
    this.loadRevealData();
  }

  loadRevealData(): void {
    const id = this.groupId();
    const userId = this.authService.getCurrentUserId();
    if (!id || !userId) return;

    this.isLoading.set(true);

    this.groupService
      .getGroupDetails(id)
      .pipe(
        switchMap((data) => {
          this.group.set(data.group);
          return this.membershipService.getMembership(userId, id);
        }),
        switchMap((m) => {
          if (!m) {
            throw new Error('Você não participa deste grupo.');
          }
          this.membership.set(m);

          if (!m.jogado) {
            this.router.navigate([`/sorteio/${id}/jogo`]);
          }

          return from(
            (async () => {
              const { data: target, error: e1 } = await this.db
                .from('usuarios')
                .select('*')
                .eq('id', m.id_pessoa_sorteada)
                .single();
              if (e1) throw new Error('Erro ao carregar sorteado');
              this.targetUser.set(target as Usuario);
              if (m.chute_id) {
                const { data: guess, error: e2 } = await this.db
                  .from('usuarios')
                  .select('*')
                  .eq('id', m.chute_id)
                  .single();
                if (e2) throw new Error('Erro ao carregar palpite');
                return guess as Usuario;
              }
              return null;
            })(),
          );
        }),
      )
      .subscribe({
        next: (chuteUser: Usuario | null) => {
          if (chuteUser) {
            this.guessUser.set(chuteUser);
          }
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message || 'Erro ao carregar revelação.');
          this.isLoading.set(false);
        },
      });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}

import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { MembershipService } from '../../../../core/services/membership.service';
import { Usuario, UsuarioGrupo, Grupo } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

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
  private readonly apiUrl = environment.apiUrl;

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

          // Fetch the drawn person (target user)
          return from(
            fetch(`${this.apiUrl}/usuarios/${m.id_pessoa_sorteada}`).then((res) => {
              if (!res.ok) throw new Error('Erro ao carregar sorteado');
              return res.json();
            }),
          ).pipe(
            switchMap((target: Usuario) => {
              this.targetUser.set(target);
              if (m.chute_id) {
                return from(
                  fetch(`${this.apiUrl}/usuarios/${m.chute_id}`).then((res) => {
                    if (!res.ok) throw new Error('Erro ao carregar palpite');
                    return res.json();
                  }),
                );
              }
              return of(null);
            }),
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

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { Usuario, UsuarioGrupo, Grupo } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-reveal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reveal.component.html',
})
export class RevealComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly groupId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly targetUser = signal<Usuario | null>(null);
  readonly guessUser = signal<Usuario | null>(null);
  readonly membership = signal<UsuarioGrupo | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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

    this.http
      .get<Grupo>(`${this.apiUrl}/grupos/${id}`)
      .pipe(
        switchMap((grp) => {
          this.group.set(grp);
          return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
            map((allMemberships) =>
              allMemberships.filter(
                (m) => String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(id)
              )
            )
          );
        }),
        switchMap((memberships) => {
          if (memberships.length === 0) {
            throw new Error('Você não participa deste grupo.');
          }
          const m = memberships[0];
          this.membership.set(m);

          if (!m.jogado) {
            // Hasn't played yet! Redirect to game screen
            this.router.navigate([`/sorteio/${id}/jogo`]);
          }

          // Fetch the drawn person (target user)
          return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${m.id_pessoa_sorteada}`).pipe(
            switchMap((target) => {
              this.targetUser.set(target);
              if (m.chute_id) {
                return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${m.chute_id}`);
              }
              return [null];
            }),
          );
        }),
      )
      .subscribe({
        next: (chuteUser) => {
          if (chuteUser) {
            this.guessUser.set(chuteUser);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
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

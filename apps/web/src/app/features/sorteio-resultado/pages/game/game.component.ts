import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { Usuario, UsuarioGrupo, Grupo } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';
import { switchMap, map } from 'rxjs/operators';

interface CharacteristicStep {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly groupId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly targetUser = signal<Usuario | null>(null);
  readonly steps = signal<CharacteristicStep[]>([]);
  readonly currentStepIndex = signal(0);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/sorteios']);
      return;
    }
    this.groupId.set(id);
    this.loadGameData();
  }

  loadGameData(): void {
    const id = this.groupId();
    const userId = this.authService.getCurrentUserId();
    if (!id || !userId) return;

    this.isLoading.set(true);

    // Get group info
    this.http
      .get<Grupo>(`${this.apiUrl}/grupos/${id}`)
      .pipe(
        switchMap((grp) => {
          this.group.set(grp);
          return this.http
            .get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`)
            .pipe(
              map((allMemberships) =>
                allMemberships.filter(
                  (m) =>
                    String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(id),
                ),
              ),
            );
        }),
        switchMap((memberships) => {
          if (memberships.length === 0) {
            throw new Error('Você não participa deste grupo.');
          }
          const membership = memberships[0];
          if (!membership.id_pessoa_sorteada) {
            throw new Error('O sorteio ainda não foi realizado para este grupo.');
          }
          if (membership.jogado) {
            // Already played! Redirect to reveal or result screen
            this.router.navigate([`/sorteio/${id}/resultado`]);
          }
          // Fetch target user (the person drawn)
          return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${membership.id_pessoa_sorteada}`);
        }),
      )
      .subscribe({
        next: (target) => {
          this.targetUser.set(target);
          this.setupSteps(target);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Erro ao carregar dados do jogo.');
          this.isLoading.set(false);
        },
      });
  }

  setupSteps(user: Usuario): void {
    const stepsList: CharacteristicStep[] = [
      {
        label: 'Idade',
        value: user.idade ? `${user.idade} anos` : 'Não informada',
        icon: 'cake',
      },
      {
        label: 'Cor do Cabelo',
        value: user.cabelo_cor || 'Não informada',
        icon: 'palette',
      },
      {
        label: 'Tipo de Cabelo',
        value: user.cabelo_tipo || 'Não informada',
        icon: 'waves',
      },
      {
        label: 'Comprimento do Cabelo',
        value: user.cabelo_comprimento || 'Não informada',
        icon: 'content_cut',
      },
      {
        label: 'Cor dos Olhos',
        value: user.olhos_cor || 'Não informada',
        icon: 'visibility',
      },
      {
        label: 'Altura',
        value: user.altura ? `${user.altura} cm` : 'Não informada',
        icon: 'height',
      },
    ];
    this.steps.set(stepsList);
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps().length - 1) {
      this.currentStepIndex.set(this.currentStepIndex() + 1);
    } else {
      this.goToGuess();
    }
  }

  goToGuess(): void {
    const id = this.groupId();
    this.router.navigate([`/sorteio/${id}/chute`]);
  }
}

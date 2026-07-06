import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { MembershipService } from '../../../../core/services/membership.service';
import { SupabaseService } from '../../../../core/services/supabase';
import { Usuario, Grupo } from '../../../../core/models';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';

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
  readonly steps = signal<CharacteristicStep[]>([]);
  readonly currentStepIndex = signal(0);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
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

    this.groupService
      .getGroupDetails(id)
      .pipe(
        switchMap((data) => {
          this.group.set(data.group);
          return this.membershipService.getMembership(userId, id);
        }),
        switchMap((membership) => {
          if (!membership) {
            throw new Error('Você não participa deste grupo.');
          }
          if (!membership.id_pessoa_sorteada) {
            throw new Error('O sorteio ainda não foi realizado para este grupo.');
          }
          if (membership.jogado) {
            this.router.navigate([`/sorteio/${id}/resultado`]);
          }

          return from(
            (async () => {
              const { data, error } = await this.db
                .from('usuarios')
                .select('*')
                .eq('id', membership.id_pessoa_sorteada!)
                .single();
              if (error) throw new Error('Erro ao carregar sorteado');
              return data as Usuario;
            })(),
          );
        }),
      )
      .subscribe({
        next: (target: Usuario) => {
          this.targetUser.set(target);
          this.setupSteps(target);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
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

import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';

import { Card } from '../../../../shared/components/card/card';
import { GrupoComParticipacao } from '../../../../core/models';

@Component({
  selector: 'app-list',
  standalone: true,

  imports: [RouterLink, Card],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly groups = signal<GrupoComParticipacao[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentUserId = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId.set(userId);
    this.loadGroups();
  }

  loadGroups(): void {
    const userId = this.currentUserId();
    if (!userId) return;

    this.isLoading.set(true);
    this.groupService.getGroupsForUser(userId).subscribe({
      next: (data) => {
        this.groups.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar grupos.');
        this.isLoading.set(false);
      },
    });
  }

  isGroupOwner(group: GrupoComParticipacao): boolean {
    return group.dono_id === this.currentUserId();
  }

  onStartDraw(group: GrupoComParticipacao): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.groupService.performDraw(group.id).subscribe({
      next: () => {
        this.loadGroups();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao realizar sorteio.');
      },
    });
  }

  onPlay(group: GrupoComParticipacao): void {
    this.router.navigate([`/sorteio/${group.id}/jogo`]);
  }

  onCardClick(group: GrupoComParticipacao): void {
    if (!group.sorteado) {
      this.router.navigate([`/sorteio/${group.id}`]);
    } else if (!group.jogado) {
      this.router.navigate([`/sorteio/${group.id}/jogo`]);
    } else {
      this.router.navigate([`/sorteio/${group.id}/resultado`]);
    }
  }
}

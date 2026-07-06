import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { filter, switchMap, catchError, finalize } from 'rxjs/operators';
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

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentUserId = signal<string | null>(null);

  private readonly refreshSubject = new BehaviorSubject<void>(undefined);
  private readonly userId$ = toObservable(this.currentUserId);

  readonly groups = toSignal(
    combineLatest([this.userId$, this.refreshSubject]).pipe(
      filter(([userId]) => userId !== null),
      switchMap(([userId]) => {
        this.isLoading.set(true);
        return this.groupService.getGroupsForUser(userId!).pipe(
          catchError((err) => {
            this.errorMessage.set(err.message || 'Erro ao carregar grupos.');
            return of([]);
          }),
          finalize(() => this.isLoading.set(false))
        );
      })
    ),
    { initialValue: [] as GrupoComParticipacao[] }
  );

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId.set(userId);
  }

  loadGroups(): void {
    this.refreshSubject.next();
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

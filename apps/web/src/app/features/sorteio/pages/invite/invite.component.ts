import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invite.component.html',
})
export class InviteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);

  readonly token = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const tokenVal = this.route.snapshot.paramMap.get('token');
    if (!tokenVal) {
      this.errorMessage.set('Token de convite inválido.');
      return;
    }
    this.token.set(tokenVal);
    this.join();
  }

  join(): void {
    const tokenVal = this.token();
    const userId = this.authService.getCurrentUserId();

    if (!tokenVal || !userId) {
      this.errorMessage.set('Usuário não autenticado ou token inválido.');
      return;
    }

    this.isLoading.set(true);
    this.groupService.joinGroup(tokenVal, userId).subscribe({
      next: (membership) => {
        this.isLoading.set(false);
        this.successMessage.set('Você entrou no grupo com sucesso!');
        setTimeout(() => {
          this.router.navigate([`/sorteio/${membership.grupo_id}`]);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao entrar no grupo.');
      },
    });
  }
}
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { AdviceService } from '../../core/services/advice.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly adviceService = inject(AdviceService);
  private readonly router = inject(Router);

  groupCode = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  adviceMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.adviceService.getAdvice().subscribe({
      next: (advice) => this.adviceMessage.set(advice),
      error: () => this.adviceMessage.set('Dica: Compartilhe o amor de Natal participando do sorteio.'),
    });
  }

  onPlay(): void {
    if (!this.groupCode.trim()) {
      this.errorMessage.set('Por favor, insira o código do grupo.');
      return;
    }

    const token = this.groupCode.trim().toUpperCase();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // If guest, save the token to local storage and redirect to login/register
    if (!this.authService.isAuthenticated()) {
      localStorage.setItem('pendingInviteToken', token);
      this.router.navigate(['/login']);
      return;
    }

    // If authenticated, join the group directly
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.groupService.joinGroup(token, userId).subscribe({
        next: (membership) => {
          this.isLoading.set(false);
          this.router.navigate(['/sorteio', membership.grupo_id]);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Erro ao entrar no grupo.');
        },
      });
    }
  }
}

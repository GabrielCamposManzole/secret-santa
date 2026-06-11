import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-criar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './criar.component.html',
})
export class CriarComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly groupName = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly currentUserId = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId.set(userId);
  }

  onSubmit(): void {
    if (!this.groupName().trim()) {
      this.errorMessage.set('Por favor, informe o nome do grupo.');
      return;
    }

    const userId = this.currentUserId();
    if (!userId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Generate a unique 8-character invite token
    const randomToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    this.groupService.createGroup(this.groupName(), randomToken, userId).subscribe({
      next: (group) => {
        this.isLoading.set(false);
        // Redirect to group details where the owner can see the invite link and manage participants
        this.router.navigate([`/sorteio/${group.id}`]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao criar grupo.');
      },
    });
  }
}
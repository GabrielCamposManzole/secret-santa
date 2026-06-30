import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Usuario, ParticipanteGrupo } from '../../../../core/models';

@Component({
  selector: 'app-chute',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chute.component.html',
})
export class ChuteComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);

  readonly id = input<string>(); // Vinculação automática do parâmetro :id da URL
  readonly groupId = signal<string | null>(null);
  readonly participants = signal<Usuario[]>([]);
  readonly filteredParticipants = signal<Usuario[]>([]);
  readonly selectedParticipantId = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.router.navigate(['/sorteios']);
      return;
    }
    this.groupId.set(id);
    this.loadParticipants();
  }

  loadParticipants(): void {
    const id = this.groupId();
    const currentUserId = this.authService.getCurrentUserId();
    if (!id || !currentUserId) return;

    this.isLoading.set(true);
    this.groupService.getGroupDetails(id).subscribe({
      next: (data) => {
        // Exclude current user from candidate list
        const others = data.participants.filter((p: ParticipanteGrupo) => p.id !== currentUserId);
        this.participants.set(others);
        this.filteredParticipants.set(others);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar participantes.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      this.filteredParticipants.set(this.participants());
      return;
    }
    const filtered = this.participants().filter((p) =>
      p.nome_completo.toLowerCase().includes(term),
    );
    this.filteredParticipants.set(filtered);
  }

  onSelect(id: string): void {
    this.selectedParticipantId.set(id);
  }

  onConfirmGuess(): void {
    const groupIdVal = this.groupId();
    const userIdVal = this.authService.getCurrentUserId();
    const guessedIdVal = this.selectedParticipantId();

    if (!groupIdVal || !userIdVal) return;
    if (!guessedIdVal) {
      this.errorMessage.set('Por favor, selecione um participante.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.groupService.submitGuess(groupIdVal, userIdVal, guessedIdVal).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Palpite confirmado!');
        setTimeout(() => {
          this.router.navigate([`/sorteio/${groupIdVal}/resultado`]);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao confirmar palpite.');
      },
    });
  }
}

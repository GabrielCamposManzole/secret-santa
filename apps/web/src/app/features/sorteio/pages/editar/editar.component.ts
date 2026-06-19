import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Grupo, Usuario, UsuarioGrupo } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar.component.html',
})
export class EditarComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly groupId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly participants = signal<any[]>([]);

  // Form fields
  readonly groupName = signal('');
  readonly newParticipantName = signal('');
  readonly newParticipantEmail = signal('');

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/sorteios']);
      return;
    }
    this.groupId.set(id);
    this.loadGroupDetails();
  }

  loadGroupDetails(): void {
    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.groupService.getGroupDetails(id).subscribe({
      next: (data) => {
        this.group.set(data.group);
        this.groupName.set(data.group.nome);
        this.participants.set(data.participants);
        this.isLoading.set(false);

        // Verify ownership
        const currentUserId = this.authService.getCurrentUserId();
        if (data.group.dono_id !== currentUserId) {
          this.router.navigate(['/sorteios']);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar detalhes do grupo.');
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

  onRemoveParticipant(participant: any): void {
    if (this.group()?.sorteado) {
      this.errorMessage.set('Não é possível remover participantes após o sorteio ser realizado.');
      return;
    }

    if (participant.id === this.group()?.dono_id) {
      this.errorMessage.set('O criador do grupo não pode ser removido.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.delete(`${this.apiUrl}/usuario_grupo/${participant.membershipId}`).subscribe({
      next: () => {
        this.loadGroupDetails();
        this.successMessage.set('Participante removido com sucesso!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao remover participante.');
      },
    });
  }

  onAddParticipant(): void {
    if (!this.newParticipantName().trim() || !this.newParticipantEmail().trim()) {
      this.errorMessage.set('Preencha o nome e e-mail do participante.');
      return;
    }

    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 1. Check if user already exists
    this.http
      .get<Usuario[]>(`${this.apiUrl}/usuarios?email=${this.newParticipantEmail().trim()}`)
      .pipe(
        switchMap((users) => {
          if (users.length > 0) {
            // User exists, add membership directly
            return this.addMembership(users[0].id, id);
          } else {
            // Create a new placeholder user account
            const newUser: Omit<Usuario, 'id'> = {
              nome_completo: this.newParticipantName().trim(),
              email: this.newParticipantEmail().trim(),
              senha: '123', // temporary default password
              idade: 18,
              cabelo_cor: '',
              cabelo_tipo: '',
              cabelo_comprimento: '',
              olhos_cor: '',
              altura: 170,
            };
            return this.http
              .post<Usuario>(`${this.apiUrl}/usuarios`, newUser)
              .pipe(switchMap((createdUser) => this.addMembership(createdUser.id, id)));
          }
        }),
      )
      .subscribe({
        next: () => {
          this.newParticipantName.set('');
          this.newParticipantEmail.set('');
          this.loadGroupDetails();
          this.successMessage.set('Participante adicionado com sucesso!');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Erro ao adicionar participante.');
        },
      });
  }

  private addMembership(userId: string, groupId: string) {
    // Check if membership already exists
    return this.http.get<UsuarioGrupo[]>(`${this.apiUrl}/usuario_grupo`).pipe(
      switchMap((allMemberships) => {
        const memberships = allMemberships.filter(
          (m) => String(m.usuario_id) === String(userId) && String(m.grupo_id) === String(groupId),
        );
        if (memberships.length > 0) {
          throw new Error('Este participante já está no grupo.');
        }
        const newMembership: Omit<UsuarioGrupo, 'id'> = {
          usuario_id: userId,
          grupo_id: groupId,
          id_pessoa_sorteada: null,
          preenchido_caracteristicas: false,
          jogado: false,
          resultado: false,
          chute_id: null,
        };
        return this.http.post<UsuarioGrupo>(`${this.apiUrl}/usuario_grupo`, newMembership);
      }),
    );
  }

  onSaveGroup(): void {
    if (!this.groupName().trim()) {
      this.errorMessage.set('Nome do grupo não pode ser vazio.');
      return;
    }

    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.patch<Grupo>(`${this.apiUrl}/grupos/${id}`, { nome: this.groupName() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Alterações salvas com sucesso!');
        setTimeout(() => {
          this.successMessage.set(null);
          this.router.navigate([`/sorteio/${id}`]);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao salvar grupo.');
      },
    });
  }

  onDeleteGroup(): void {
    const id = this.groupId();
    if (!id) return;

    const confirmed = confirm(
      'Tem certeza que deseja excluir permanentemente este grupo e todos os seus participantes do sorteio? Esta ação não pode ser desfeita.',
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.groupService.deleteGroup(id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Grupo excluído com sucesso!');
        setTimeout(() => {
          this.successMessage.set(null);
          this.router.navigate(['/sorteios']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao excluir o grupo.');
      },
    });
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../../core/services/group.service';
import { MembershipService } from '../../../../core/services/membership.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Grupo, Usuario, UsuarioGrupo } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';
import { from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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
  private readonly membershipService = inject(MembershipService);
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

    from(
      fetch(`${this.apiUrl}/usuario_grupo/${participant.membershipId}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao remover participante');
      })
    ).subscribe({
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
    const email = this.newParticipantEmail().trim();
    const nome = this.newParticipantName().trim();
    if (!nome || !email) {
      this.errorMessage.set('Preencha o nome e e-mail do participante.');
      return;
    }

    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 1. Check if user already exists
    from(
      fetch(`${this.apiUrl}/usuarios?email=${email}`).then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        return res.json();
      })
    ).pipe(
      switchMap((users: Usuario[]) => {
        if (users.length > 0) {
          return this.addMembership(users[0].id, id);
        } else {
          // Create new user
          const newUser: Omit<Usuario, 'id'> = {
            nome_completo: nome,
            email: email,
            senha: '123',
            idade: 18,
            cabelo_cor: '',
            cabelo_tipo: '',
            cabelo_comprimento: '',
            olhos_cor: '',
            altura: 170,
          };
          return from(
            fetch(`${this.apiUrl}/usuarios`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newUser),
            }).then((res) => {
              if (!res.ok) throw new Error('Erro ao criar usuário');
              return res.json();
            })
          ).pipe(switchMap((createdUser: Usuario) => this.addMembership(createdUser.id, id)));
        }
      })
    ).subscribe({
      next: () => {
        this.newParticipantName.set('');
        this.newParticipantEmail.set('');
        this.loadGroupDetails();
        this.successMessage.set('Participante adicionado com sucesso!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao adicionar participante.');
      },
    });
  }

  private addMembership(userId: string, groupId: string) {
    return this.membershipService.getMembership(userId, groupId).pipe(
      switchMap((membership) => {
        if (membership) {
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
        return from(
          fetch(`${this.apiUrl}/usuario_grupo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMembership),
          }).then((res) => {
            if (!res.ok) throw new Error('Erro ao adicionar participante ao grupo');
            return res.json();
          })
        );
      })
    );
  }

  onSaveGroup(): void {
    const nome = this.groupName().trim();
    if (!nome) {
      this.errorMessage.set('Nome do grupo não pode ser vazio.');
      return;
    }

    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    from(
      fetch(`${this.apiUrl}/grupos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      }).then((res) => {
        if (!res.ok) throw new Error('Erro ao salvar grupo');
        return res.json();
      })
    ).subscribe({
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

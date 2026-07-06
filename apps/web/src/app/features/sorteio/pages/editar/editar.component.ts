import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../../core/services/group.service';
import { MembershipService } from '../../../../core/services/membership.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase';
import { Grupo, Usuario, UsuarioGrupo, ParticipanteGrupo } from '../../../../core/models';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar.component.html',
})
export class EditarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly membershipService = inject(MembershipService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly emailService = inject(EmailService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any {
    return this.supabaseService.client;
  }

  readonly id = input<string>(); // Vinculação automática do parâmetro :id da URL
  readonly groupId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly participants = signal<ParticipanteGrupo[]>([]);

  // Form fields
  readonly groupName = signal('');
  readonly newParticipantName = signal('');
  readonly newParticipantEmail = signal('');

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

  onRemoveParticipant(participant: ParticipanteGrupo): void {
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
      (async () => {
        const { error } = await this.db
          .from('usuario_grupo')
          .delete()
          .eq('id', participant.membershipId);
        if (error) throw new Error(error.message);
      })(),
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

    // 1. Verifica se usuário já existe, senão cria
    from(
      (async () => {
        const { data: users } = await this.db.from('usuarios').select('*').eq('email', email);
        return (users as Usuario[]) ?? [];
      })(),
    )
      .pipe(
        switchMap((users: Usuario[]) => {
          if (users.length > 0) {
            return this.addMembership(users[0].id, id);
          } else {
            const newUser: Omit<Usuario, 'id'> = {
              nome_completo: nome,
              email: email,
              idade: 18,
              cabelo_cor: '',
              cabelo_tipo: '',
              cabelo_comprimento: '',
              olhos_cor: '',
              altura: 170,
            };
            return from(
              (async () => {
                const { data: created, error } = await this.db
                  .from('usuarios')
                  .insert(newUser)
                  .select()
                  .single();
                if (error) throw new Error(error.message);
                return created as Usuario;
              })(),
            ).pipe(switchMap((createdUser: Usuario) => this.addMembership(createdUser.id, id)));
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
        error: (err: Error) => {
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
          (async () => {
            const { data: created, error } = await this.db
              .from('usuario_grupo')
              .insert(newMembership)
              .select()
              .single();
            if (error) throw new Error(error.message);
            return created;
          })(),
        );
      }),
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
      (async () => {
        const { error } = await this.db.from('grupos').update({ nome }).eq('id', id);
        if (error) throw new Error(error.message);
      })(),
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

  onResendInvitation(participant: ParticipanteGrupo): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.emailService
      .sendInvitation(participant.email, participant.nome_completo, this.groupName())
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            `Convite re-enviado com sucesso para ${participant.nome_completo}!`,
          );
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Erro ao re-enviar convite.');
        },
      });
  }
}

import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { GroupService } from '../../../../core/services/group.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EmailService } from '../../../../core/services/email.service';
import { Grupo, ParticipanteGrupo } from '../../../../core/models';
import { MaskEmailPipe } from '../../../../shared/pipes/mask-email.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MaskEmailPipe],
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly emailService = inject(EmailService);

  readonly id = input<string>(); // Vinculação automática do parâmetro :id da URL
  readonly groupDetails = input<{ group: Grupo; participants: ParticipanteGrupo[] }>();
  readonly groupId = signal<string | null>(null);
  readonly currentUserId = signal<string | null>(null);
  readonly group = signal<Grupo | null>(null);
  readonly participants = signal<ParticipanteGrupo[]>([]);
  readonly currentUserMembership = signal<ParticipanteGrupo | null>(null);

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
    this.currentUserId.set(this.authService.getCurrentUserId());
    this.loadDetails();
  }

  loadDetails(): void {
    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.groupService.getGroupDetails(id).subscribe({
      next: (data) => {
        this.group.set(data.group);
        this.participants.set(data.participants);

        // Find current user's membership details
        const currentUserId = this.currentUserId();
        const membership = data.participants.find((p: ParticipanteGrupo) => p.id === currentUserId);
        this.currentUserMembership.set(membership || null);

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar detalhes do grupo.');
        this.isLoading.set(false);
      },
    });
  }

  getInviteLink(): string {
    const grp = this.group();
    if (!grp) return '';
    const origin = window.location.origin;
    return `${origin}/convite/${grp.token}`;
  }

  copyInviteLink(): void {
    const link = this.getInviteLink();
    navigator.clipboard.writeText(link).then(
      () => {
        this.successMessage.set('Link de convite copiado!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      () => {
        this.errorMessage.set('Erro ao copiar link de convite.');
      },
    );
  }

  isOwner(): boolean {
    const grp = this.group();
    return grp ? grp.dono_id === this.currentUserId() : false;
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

  onStartDraw(): void {
    const id = this.groupId();
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.groupService.performDraw(id).subscribe({
      next: () => {
        // Após o sorteio, recarrega os detalhes para ter os dados atualizados
        // e dispara os e-mails para todos os participantes
        this.groupService.getGroupDetails(id).subscribe({
          next: (data) => {
            this.group.set(data.group);
            this.participants.set(data.participants);

            const grupo = data.group;
            const emailObservables = data.participants
              .filter((p) => !!p.email)
              .map((p) =>
                this.emailService.sendGameTokenAndCredentials({
                  to: p.email!,
                  nome: p.nome_completo ?? undefined,
                  token: grupo.token,
                  // `p.senha` existirá apenas para participantes novos (sem cadastro prévio).
                  // O campo é opcional: se undefined, o e-mail não exibirá a seção de senha.
                  senha: (p as ParticipanteGrupo & { senha?: string }).senha,
                  grupoNome: grupo.nome,
                }),
              );

            if (emailObservables.length > 0) {
              forkJoin(emailObservables).subscribe({
                next: () => {
                  this.successMessage.set(
                    'Sorteio realizado! E-mails enviados aos participantes. 🎅',
                  );
                  setTimeout(() => this.successMessage.set(null), 5000);
                },
                error: () => {
                  // O sorteio ocorreu, apenas o envio de e-mail falhou
                  this.successMessage.set('Sorteio realizado! (Falha ao enviar alguns e-mails)');
                  setTimeout(() => this.successMessage.set(null), 5000);
                },
              });
            } else {
              this.successMessage.set('Sorteio realizado com sucesso!');
              setTimeout(() => this.successMessage.set(null), 3000);
            }

            this.isLoading.set(false);
          },
          error: () => {
            // O sorteio ocorreu mas falhou ao recarregar
            this.loadDetails();
            this.successMessage.set('Sorteio realizado com sucesso!');
            setTimeout(() => this.successMessage.set(null), 3000);
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao realizar sorteio.');
      },
    });
  }

  onPlay(): void {
    const id = this.groupId();
    if (!id) return;
    this.router.navigate([`/sorteio/${id}/jogo`]);
  }

  onViewResult(): void {
    const id = this.groupId();
    if (!id) return;
    this.router.navigate([`/sorteio/${id}/resultado`]);
  }
}

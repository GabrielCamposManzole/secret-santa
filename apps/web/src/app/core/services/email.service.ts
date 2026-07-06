import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase';

export interface SendGameTokenPayload {
  /** E-mail do destinatário */
  to: string;
  /** Nome do participante (opcional) */
  nome?: string;
  /** Token de acesso ao jogo */
  token: string;
  /** Senha gerada (apenas para usuários novos) */
  senha?: string;
  /** Nome do grupo do sorteio */
  grupoNome?: string;
}

/**
 * EmailService — Singleton responsável por disparar e-mails transacionais.
 *
 * Toda comunicação é delegada à Edge Function `send-email` hospedada no Supabase,
 * que detém a API key do SendGrid nos seus secrets remotos.
 * O Angular NUNCA tem acesso à chave do SendGrid.
 */
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Envia o e-mail de recuperação de senha para o usuário.
   * Utilizado em: `recuperar-senha.component.ts`
   *
   * @param email - E-mail do usuário que solicitou a recuperação
   * @param nome  - Nome do usuário (opcional, para personalizar o e-mail)
   */
  sendPasswordRecovery(email: string, nome?: string): Observable<void> {
    return from(
      this.supabase.client.functions
        .invoke('send-email', {
          body: {
            type: 'password_recovery',
            to: email,
            nome,
            // O token temporário de recuperação é gerado aqui e enviado no body.
            // Em produção, idealmente seria gerado na Edge Function, mas por ora
            // usamos um token simples para não expor lógica crítica no cliente.
            token: Math.random().toString(36).substring(2, 10).toUpperCase(),
          },
        })
        .then(({ error }) => {
          if (error) throw new Error(error.message ?? 'Erro ao enviar e-mail de recuperação.');
        }),
    );
  }

  /**
   * Envia o token do sorteio e, opcionalmente, a senha de acesso ao participante.
   * Utilizado em: `detail.component.ts` (após o sorteio ser realizado).
   *
   * @param payload - Dados do participante e do sorteio
   */
  sendGameTokenAndCredentials(payload: SendGameTokenPayload): Observable<void> {
    return from(
      this.supabase.client.functions
        .invoke('send-email', {
          body: {
            type: 'game_token',
            to: payload.to,
            nome: payload.nome,
            token: payload.token,
            senha: payload.senha,
            grupoNome: payload.grupoNome,
          },
        })
        .then(({ error }) => {
          if (error) throw new Error(error.message ?? 'Erro ao enviar e-mail do jogo.');
        }),
    );
  }

  /**
   * Envia um e-mail de convite para um participante recém-adicionado a um grupo.
   */
  sendInvitation(email: string, nome: string, grupoNome: string): Observable<void> {
    return from(
      this.supabase.client.functions
        .invoke('send-email', {
          body: {
            type: 'invitation',
            to: email,
            nome,
            grupoNome,
          },
        })
        .then(({ error }) => {
          if (error) throw new Error(error.message ?? 'Erro ao enviar e-mail de convite.');
        }),
    );
  }
}

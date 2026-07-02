import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EmailResponse {
  success: boolean;
  message: string;
}

/**
 * EmailService — responsável por enviar e-mails transacionais via Edge Functions do Supabase.
 *
 * A SENDGRID_API_KEY é armazenada como secret remoto no Supabase (variável: SENDGRID_API_KEY)
 * e jamais é exposta no frontend. Todo o processamento sensível ocorre na Edge Function.
 */
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  /** URL base das Edge Functions do projeto Supabase */
  private readonly edgeFunctionUrl = environment.supabaseEdgeFunctionUrl;

  /**
   * Envia o e-mail de recuperação de senha.
   * Chama a Edge Function `send-recovery-email` que utiliza a SENDGRID_API_KEY.
   *
   * @param email - E-mail cadastrado do usuário que esqueceu a senha.
   */
  sendPasswordRecovery(email: string): Observable<EmailResponse> {
    return from(
      fetch(`${this.edgeFunctionUrl}/send-recovery-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((err) => {
              throw new Error(err?.message || 'Erro ao enviar e-mail de recuperação.');
            })
            .catch(() => {
              throw new Error(`Erro HTTP ${res.status} ao enviar e-mail de recuperação.`);
            });
        }
        return res.json();
      }),
    ).pipe(
      map((data) => ({
        success: true,
        message: data?.message || 'E-mail de recuperação enviado com sucesso!',
      })),
    );
  }

  /**
   * Envia o token do sorteio e a senha do usuário sorteado por e-mail.
   * Chama a Edge Function `send-draw-token` que utiliza a SENDGRID_API_KEY.
   *
   * Deve ser chamado após a realização do sorteio, para notificar cada participante.
   *
   * @param email       - E-mail do participante que receberá a notificação.
   * @param token       - Token do sorteio (identificador único do grupo/resultado).
   * @param senhaUsuario - Senha provisória ou dado sensível a ser enviado ao participante.
   */
  sendDrawToken(email: string, token: string, senhaUsuario: string): Observable<EmailResponse> {
    return from(
      fetch(`${this.edgeFunctionUrl}/send-draw-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, senha: senhaUsuario }),
      }).then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((err) => {
              throw new Error(err?.message || 'Erro ao enviar token do sorteio.');
            })
            .catch(() => {
              throw new Error(`Erro HTTP ${res.status} ao enviar token do sorteio.`);
            });
        }
        return res.json();
      }),
    ).pipe(
      map((data) => ({
        success: true,
        message: data?.message || 'Token do sorteio enviado com sucesso!',
      })),
    );
  }
}

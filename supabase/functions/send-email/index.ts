import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  type: 'password_recovery' | 'game_token' | 'invitation';
  to: string;
  nome?: string;
  token?: string;
  senha?: string;
  grupoNome?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@secretsanta.app';
    const FROM_NAME = Deno.env.get('FROM_NAME') ?? 'Secret Santa 🎅';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SENDGRID_API_KEY) {
      return new Response(JSON.stringify({ error: 'SENDGRID_API_KEY não configurada.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: EmailPayload = await req.json();
    const { type, to, nome, token, senha, grupoNome } = payload;

    let subject = '';
    let htmlContent = '';

    if (type === 'password_recovery') {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return new Response(JSON.stringify({ error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token de recuperação não fornecido.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Buscar o ID correspondente ao email
      const { data: usuario, error: dbError } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('email', to)
        .maybeSingle();

      if (dbError) {
        return new Response(JSON.stringify({ error: 'Erro ao consultar usuário no banco.', detail: dbError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!usuario) {
        return new Response(JSON.stringify({ error: 'Nenhum usuário encontrado com este e-mail.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Atualiza a senha no Auth
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
        password: token,
      });

      if (authError) {
        return new Response(JSON.stringify({ error: 'Erro ao atualizar a senha no Auth.', detail: authError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      subject = '🔑 Recuperação de Senha — Secret Santa';
      htmlContent = `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9f9; padding: 32px; border-radius: 16px;">
          <h1 style="color: #D42426; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 8px;">🎅 Secret Santa</h1>
          <h2 style="color: #1a1c1c; font-size: 20px;">Recuperação de Senha</h2>
          <p style="color: #444; line-height: 1.6;">
            Olá${nome ? `, <strong>${nome}</strong>` : ''}! Recebemos uma solicitação de recuperação de senha para a sua conta.
          </p>
          <p style="color: #444; line-height: 1.6;">
            Se você não solicitou isso, pode ignorar este e-mail com segurança.
          </p>
          <p style="color: #444; line-height: 1.6;">
            Sua nova senha temporária é: <strong style="color: #D42426; font-size: 18px;">${token ?? 'N/A'}</strong>
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">
            © ${new Date().getFullYear()} Secret Santa. Todos os direitos reservados.
          </p>
        </div>
      `;
    } else if (type === 'invitation') {
      subject = `🎄 Você foi convidado para o amigo oculto do grupo "${grupoNome ?? 'Secret Santa'}"!`;
      htmlContent = `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9f9; padding: 32px; border-radius: 16px;">
          <h1 style="color: #D42426; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 8px;">🎅 Secret Santa</h1>
          <h2 style="color: #1a1c1c; font-size: 20px;">Olá, ${nome ?? 'Participante'}!</h2>
          <p style="color: #444; line-height: 1.6;">
            Você foi convidado a participar do amigo oculto no grupo <strong>${grupoNome ?? 'Secret Santa'}</strong>!
          </p>
          <p style="color: #444; line-height: 1.6;">
            Para participar da brincadeira, você precisa criar uma conta usando o seu e-mail e preencher suas características físicas (assim o sorteio poderá ser realizado).
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="https://gabrielcamposmanzole.github.io/secret-santa/#/cadastro" style="background-color: #D42426; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Criar Minha Conta</a>
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.6;">
            Se o botão acima não funcionar, acesse o link: <br>
            <a href="https://gabrielcamposmanzole.github.io/secret-santa/#/cadastro" style="color: #D42426;">https://gabrielcamposmanzole.github.io/secret-santa/#/cadastro</a>
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">
            © ${new Date().getFullYear()} Secret Santa. Todos os direitos reservados.
          </p>
        </div>
      `;
    } else if (type === 'game_token') {
      subject = `🎁 Você foi sorteado no grupo "${grupoNome ?? 'Secret Santa'}"!`;
      htmlContent = `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9f9; padding: 32px; border-radius: 16px;">
          <h1 style="color: #D42426; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 8px;">🎅 Secret Santa</h1>
          <h2 style="color: #1a1c1c; font-size: 20px;">Você está no jogo, ${nome ?? 'participante'}!</h2>
          <p style="color: #444; line-height: 1.6;">
            O sorteio do grupo <strong>${grupoNome ?? 'Secret Santa'}</strong> foi realizado. Aqui estão seus dados de acesso:
          </p>
          <div style="background: #1a1c1c; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #e6e6e6; margin: 0 0 8px; font-size: 14px;">Token de acesso ao jogo:</p>
            <p style="color: #D42426; font-size: 22px; font-weight: bold; margin: 0; letter-spacing: 4px;">${token ?? 'N/A'}</p>
            ${
              senha
                ? `<p style="color: #e6e6e6; margin: 12px 0 4px; font-size: 14px;">Sua senha (novo cadastro):</p>
                   <p style="color: #f8f9f9; font-size: 18px; font-weight: bold; margin: 0;">${senha}</p>`
                : ''
            }
          </div>
          <p style="color: #444; line-height: 1.6;">
            Use esses dados para acessar o jogo e descobrir quem é o seu amigo secreto. Boa sorte! 🍀
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">
            © ${new Date().getFullYear()} Secret Santa. Todos os direitos reservados.
          </p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Tipo de e-mail inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sendgridBody = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [{ type: 'text/html', value: htmlContent }],
    };

    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail', detail: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

-- SQL para Configurar Banco de Dados Remoto no Supabase
-- Copie e cole este código no SQL Editor do seu Dashboard do Supabase.

-- 1. Remover tabelas antigas se existirem
DROP TABLE IF EXISTS public.usuario_grupo CASCADE;
DROP TABLE IF EXISTS public.grupos CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 2. Criar tabela de USUARIOS
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar tabela de GRUPOS
CREATE TABLE public.grupos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    sorteado BOOLEAN NOT NULL DEFAULT FALSE,
    finalizado BOOLEAN NOT NULL DEFAULT FALSE,
    dono_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Criar tabela de USUARIO_GRUPO (membros do grupo)
CREATE TABLE public.usuario_grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    id_pessoa_sorteada UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    preenchido_caracteristicas BOOLEAN NOT NULL DEFAULT FALSE,
    jogado BOOLEAN NOT NULL DEFAULT FALSE,
    resultado BOOLEAN NOT NULL DEFAULT FALSE,
    chute_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_usuario_grupo UNIQUE (usuario_id, grupo_id)
);

-- Habilitar RLS nas tabelas mas liberar acessos básicos para testes da aplicação
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_grupo ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS restritas ao dono do registro
CREATE POLICY "Permitir select, insert, update, delete apenas para o proprio usuario" ON public.usuarios
    FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir select, insert, update, delete apenas para o dono do grupo" ON public.grupos
    FOR ALL TO authenticated USING (auth.uid() = dono_id) WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir select, insert, update, delete apenas para o usuario da participacao" ON public.usuario_grupo
    FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- 5. Triggers para sicronizar automaticamente o auth.users do Supabase com public.usuarios

-- Cadastro automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome_completo, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualização automática
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.usuarios
  SET nome_completo = coalesce(new.raw_user_meta_data->>'nome_completo', nome_completo),
      email = coalesce(new.email, email)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- Sincronizar usuários existentes no Auth
INSERT INTO public.usuarios (id, nome_completo, email)
SELECT id, coalesce(raw_user_meta_data->>'nome_completo', ''), email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

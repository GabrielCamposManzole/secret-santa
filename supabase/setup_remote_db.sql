-- SQL para Configurar Banco de Dados Remoto no Supabase
-- Copie e cole este código no SQL Editor do seu Dashboard do Supabase.

-- 1. Criar tabela de USUARIOS se não existir
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    idade INT DEFAULT 18,
    cabelo_cor TEXT DEFAULT '',
    cabelo_tipo TEXT DEFAULT '',
    cabelo_comprimento TEXT DEFAULT '',
    olhos_cor TEXT DEFAULT '',
    altura NUMERIC DEFAULT 170,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criar tabela de GRUPOS se não existir
CREATE TABLE IF NOT EXISTS public.grupos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    sorteado BOOLEAN NOT NULL DEFAULT FALSE,
    finalizado BOOLEAN NOT NULL DEFAULT FALSE,
    dono_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar tabela de USUARIO_GRUPO (membros do grupo) se não existir
CREATE TABLE IF NOT EXISTS public.usuario_grupo (
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

-- 4. Criar tabela de CARACTERISTICAS se não existir
CREATE TABLE IF NOT EXISTS public.caracteristicas (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caracteristicas ENABLE ROW LEVEL SECURITY;

-- 5. Recriar Políticas de RLS de forma robusta e livre de loops/violações

-- Tabela: public.usuarios
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o proprio usuario" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir select de usuarios para autenticados" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir insert para autenticados" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir update apenas para o proprio usuario" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir delete apenas para o proprio usuario" ON public.usuarios;

CREATE POLICY "Permitir select de usuarios para autenticados" ON public.usuarios
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert para autenticados" ON public.usuarios
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update apenas para o proprio usuario" ON public.usuarios
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir delete apenas para o proprio usuario" ON public.usuarios
    FOR DELETE TO authenticated USING (auth.uid() = id);


-- Tabela: public.grupos
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o dono do grupo" ON public.grupos;
DROP POLICY IF EXISTS "Permitir select de grupos para autenticados" ON public.grupos;
DROP POLICY IF EXISTS "Permitir insert de grupos para autenticados" ON public.grupos;
DROP POLICY IF EXISTS "Permitir update de grupos apenas para o dono" ON public.grupos;
DROP POLICY IF EXISTS "Permitir delete de grupos apenas para o dono" ON public.grupos;

CREATE POLICY "Permitir select de grupos para autenticados" ON public.grupos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de grupos para autenticados" ON public.grupos
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir update de grupos apenas para o dono" ON public.grupos
    FOR UPDATE TO authenticated USING (auth.uid() = dono_id) WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir delete de grupos apenas para o dono" ON public.grupos
    FOR DELETE TO authenticated USING (auth.uid() = dono_id);


-- Tabela: public.usuario_grupo
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o usuario da participacao" ON public.usuario_grupo;
DROP POLICY IF EXISTS "Permitir select de participacoes para autenticados" ON public.usuario_grupo;
DROP POLICY IF EXISTS "Permitir insert de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo;
DROP POLICY IF EXISTS "Permitir update de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo;
DROP POLICY IF EXISTS "Permitir delete de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo;

CREATE POLICY "Permitir select de participacoes para autenticados" ON public.usuario_grupo
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR INSERT TO authenticated 
    WITH CHECK (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );

CREATE POLICY "Permitir update de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR UPDATE TO authenticated 
    USING (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    )
    WITH CHECK (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );

CREATE POLICY "Permitir delete de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR DELETE TO authenticated 
    USING (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );


-- Tabela: public.caracteristicas
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o dono da caracteristica" ON public.caracteristicas;
DROP POLICY IF EXISTS "Permitir select de caracteristicas para o proprio usuario ou para quem o sorteou" ON public.caracteristicas;
DROP POLICY IF EXISTS "Permitir select de caracteristicas para autenticados" ON public.caracteristicas;
DROP POLICY IF EXISTS "Permitir insert de caracteristicas apenas para o proprio usuario" ON public.caracteristicas;
DROP POLICY IF EXISTS "Permitir update de caracteristicas apenas para o proprio usuario" ON public.caracteristicas;
DROP POLICY IF EXISTS "Permitir delete de caracteristicas apenas para o proprio usuario" ON public.caracteristicas;

CREATE POLICY "Permitir select de caracteristicas para autenticados" ON public.caracteristicas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Permitir update de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR UPDATE TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Permitir delete de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR DELETE TO authenticated USING (usuario_id = auth.uid());


-- 6. Triggers para sicronizar automaticamente o auth.users do Supabase com public.usuarios

-- Cadastro automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
    UPDATE public.usuarios
    SET id = new.id,
        nome_completo = COALESCE(NULLIF(new.raw_user_meta_data->>'nome_completo', ''), nome_completo)
    WHERE email = new.email;
  ELSE
    INSERT INTO public.usuarios (id, nome_completo, email)
    VALUES (
      new.id,
      coalesce(new.raw_user_meta_data->>'nome_completo', ''),
      new.email
    );
  END IF;
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

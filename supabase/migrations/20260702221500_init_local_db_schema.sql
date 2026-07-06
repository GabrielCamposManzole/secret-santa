-- Migration: 20260702221500_init_local_db_schema.sql
-- Criação da estrutura de banco de dados compatível com o frontend Angular e o docs/sdd.md

-- 1. Remover tabelas antigas se existirem (tanto no singular quanto no plural)
DROP TABLE IF EXISTS public.caracteristicas CASCADE;
DROP TABLE IF EXISTS public.usuario_grupo CASCADE;
DROP TABLE IF EXISTS public.grupo CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.grupos CASCADE;

-- 2. Criar tabela de USUARIOS
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    idade INT,
    cabelo_cor TEXT,
    cabelo_tipo TEXT,
    cabelo_comprimento TEXT,
    olhos_cor TEXT,
    altura NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar tabela de GRUPOS
CREATE TABLE public.grupos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    sorteado BOOLEAN NOT NULL DEFAULT FALSE,
    finalizado BOOLEAN NOT NULL DEFAULT FALSE,
    dono_id UUID REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Criar tabela de USUARIO_GRUPO (membros do grupo)
CREATE TABLE public.usuario_grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    id_pessoa_sorteada UUID REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    preenchido_caracteristicas BOOLEAN NOT NULL DEFAULT FALSE,
    jogado BOOLEAN NOT NULL DEFAULT FALSE,
    resultado BOOLEAN NOT NULL DEFAULT FALSE,
    chute_id UUID REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_usuario_grupo UNIQUE (usuario_id, grupo_id)
);

-- 5. Criar tabela de CARACTERISTICAS (conforme especificado no Mermaid)
CREATE TABLE public.caracteristicas (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caracteristicas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS restritas ao dono do registro
CREATE POLICY "Permitir select, insert, update, delete apenas para o proprio usuario" ON public.usuarios
    FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir select, insert, update, delete apenas para o dono do grupo" ON public.grupos
    FOR ALL TO authenticated USING (auth.uid() = dono_id) WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir select, insert, update, delete apenas para o usuario da participacao" ON public.usuario_grupo
    FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Permitir select, insert, update, delete apenas para o dono da caracteristica" ON public.caracteristicas
    FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- 6. Triggers para sicronizar automaticamente o auth.users do Supabase com public.usuarios

-- Cadastro automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = new.email) THEN
    UPDATE public.usuarios
    SET id = new.id,
        nome_completo = COALESCE(NULLIF(new.raw_user_meta_data->>'nome_completo', ''), nome_completo),
        idade = COALESCE((new.raw_user_meta_data->>'idade')::INT, idade),
        cabelo_cor = COALESCE(new.raw_user_meta_data->>'cabelo_cor', cabelo_cor),
        cabelo_tipo = COALESCE(new.raw_user_meta_data->>'cabelo_tipo', cabelo_tipo),
        cabelo_comprimento = COALESCE(new.raw_user_meta_data->>'cabelo_comprimento', cabelo_comprimento),
        olhos_cor = COALESCE(new.raw_user_meta_data->>'olhos_cor', olhos_cor),
        altura = COALESCE((new.raw_user_meta_data->>'altura')::NUMERIC, altura)
    WHERE email = new.email;
  ELSE
    INSERT INTO public.usuarios (
      id, 
      nome_completo, 
      email,
      idade,
      cabelo_cor,
      cabelo_tipo,
      cabelo_comprimento,
      olhos_cor,
      altura
    )
    VALUES (
      new.id,
      coalesce(new.raw_user_meta_data->>'nome_completo', ''),
      new.email,
      (new.raw_user_meta_data->>'idade')::INT,
      new.raw_user_meta_data->>'cabelo_cor',
      new.raw_user_meta_data->>'cabelo_tipo',
      new.raw_user_meta_data->>'cabelo_comprimento',
      new.raw_user_meta_data->>'olhos_cor',
      (new.raw_user_meta_data->>'altura')::NUMERIC
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
      email = coalesce(new.email, email),
      idade = (new.raw_user_meta_data->>'idade')::INT,
      cabelo_cor = new.raw_user_meta_data->>'cabelo_cor',
      cabelo_tipo = new.raw_user_meta_data->>'cabelo_tipo',
      cabelo_comprimento = new.raw_user_meta_data->>'cabelo_comprimento',
      olhos_cor = new.raw_user_meta_data->>'olhos_cor',
      altura = (new.raw_user_meta_data->>'altura')::NUMERIC
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- Sincronizar usuários existentes no Auth
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email,
  idade,
  cabelo_cor,
  cabelo_tipo,
  cabelo_comprimento,
  olhos_cor,
  altura
)
SELECT 
  id, 
  coalesce(raw_user_meta_data->>'nome_completo', ''), 
  email,
  coalesce((raw_user_meta_data->>'idade')::INT, 18),
  coalesce(raw_user_meta_data->>'cabelo_cor', ''),
  coalesce(raw_user_meta_data->>'cabelo_tipo', ''),
  coalesce(raw_user_meta_data->>'cabelo_comprimento', ''),
  coalesce(raw_user_meta_data->>'olhos_cor', ''),
  coalesce((raw_user_meta_data->>'altura')::NUMERIC, 170)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

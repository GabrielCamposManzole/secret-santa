-- ============================================================
-- SecretSanta - Migração Inicial
-- Criação das tabelas conforme diagrama ER do SDD (seção 3.2)
-- ============================================================

-- 1. USUARIO
-- Dados de conta do participante.
CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL PRIMARY KEY,
    nome_completo TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    senha       TEXT    NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. GRUPO
-- Nome, token de convite e estado global do jogo.
CREATE TABLE IF NOT EXISTS grupo (
    id          SERIAL PRIMARY KEY,
    nome        TEXT    NOT NULL,
    token       TEXT    NOT NULL UNIQUE,
    sorteado    BOOLEAN NOT NULL DEFAULT FALSE,
    finalizado  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USUARIO_GRUPO
-- Tabela associativa: quem está no grupo, quem sorteou e se já jogou.
CREATE TABLE IF NOT EXISTS usuario_grupo (
    id                          SERIAL  PRIMARY KEY,
    usuario_id                  INT     NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    grupo_id                    INT     NOT NULL REFERENCES grupo(id)   ON DELETE CASCADE,
    id_pessoa_sorteada          INT              REFERENCES usuario(id) ON DELETE SET NULL,
    preenchido_caracteristicas  BOOLEAN NOT NULL DEFAULT FALSE,
    jogado                      BOOLEAN NOT NULL DEFAULT FALSE,
    resultado                   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Um usuário só pode participar uma vez de cada grupo
    CONSTRAINT uq_usuario_grupo UNIQUE (usuario_id, grupo_id)
);

-- 4. CARACTERISTICAS
-- Dicas cadastradas pelo usuário para serem descobertas.
CREATE TABLE IF NOT EXISTS caracteristicas (
    id          SERIAL PRIMARY KEY,
    descricao   TEXT   NOT NULL,
    usuario_id  INT    NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Índices para performance em consultas frequentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_usuario_grupo_usuario  ON usuario_grupo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_grupo_grupo    ON usuario_grupo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_caracteristicas_usuario ON caracteristicas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_grupo_token            ON grupo(token);

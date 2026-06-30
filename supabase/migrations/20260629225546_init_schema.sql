-- Create USUARIO table
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Create GRUPO table
CREATE TABLE IF NOT EXISTS grupo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    sorteado BOOLEAN NOT NULL DEFAULT FALSE,
    finalizado BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create USUARIO_GRUPO table
CREATE TABLE IF NOT EXISTS usuario_grupo (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    grupo_id INT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    id_pessoa_sorteada INT REFERENCES usuario(id) ON DELETE SET NULL,
    preenchido_caracteristicas BOOLEAN NOT NULL DEFAULT FALSE,
    jogado BOOLEAN NOT NULL DEFAULT FALSE,
    resultado BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(usuario_id, grupo_id)
);

-- Create CARACTERISTICAS table
CREATE TABLE IF NOT EXISTS caracteristicas (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

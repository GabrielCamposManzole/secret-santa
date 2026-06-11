export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  senha?: string;
  idade?: number;
  cabelo_cor?: string;
  cabelo_tipo?: string;
  cabelo_comprimento?: string;
  olhos_cor?: string;
  altura?: number;
}

export interface Grupo {
  id: string;
  nome: string;
  token: string;
  sorteado: boolean;
  finalizado: boolean;
  dono_id: string;
}

export interface UsuarioGrupo {
  id: string;
  usuario_id: string;
  grupo_id: string;
  id_pessoa_sorteada: string | null;
  preenchido_caracteristicas: boolean;
  jogado: boolean;
  resultado: boolean;
  chute_id: string | null;
}
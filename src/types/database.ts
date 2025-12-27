export interface Perfil {
  id: number;
  nome: string; // 'super_admin', 'admin', 'motoboy', 'financeiro'
  descricao?: string;
  created_at?: string;
}

export interface ConfiguracoesSistema {
  chave: string;
  valor: string;
  descricao?: string;
  updated_at?: string;
}

export interface Client {
  id: number; // BIGINT
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  id: string; // UUID references auth.users
  perfil_id: number;
  cliente_id?: number | null;
  nome_completo: string;
  cpf: string;
  email: string;
  primeiro_acesso: boolean;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  // Relacionamentos (virtual)
  perfil?: Perfil;
  cliente?: Client;
  turnos?: UsuarioTurno[];
}

export interface UsuarioTurno {
  id: number;
  usuario_id: string;
  hora_inicio: string; // TIME
  hora_fim: string; // TIME
  created_at?: string;
}

export interface RegistroPonto {
  id: number; // BIGINT
  usuario_id: string; // UUID
  data_referencia: string; // DATE (YYYY-MM-DD)
  entrada_hora?: string | null; // TIMESTAMP WITH TIME ZONE
  entrada_km?: number | null;
  entrada_lat?: number | null;
  entrada_long?: number | null;
  saida_hora?: string | null; // TIMESTAMP WITH TIME ZONE
  saida_km?: number | null;
  saida_lat?: number | null;
  saida_long?: number | null;
  status_entrada?: string | null; // 'VERDE', 'AMARELO', 'VERMELHO', 'CINZA'
  status_saida?: string | null;
  observacao?: string | null;
  criado_por?: string | null; // UUID
  created_at?: string;
  updated_at?: string;
  // Relacionamentos (virtual)
  usuario?: Usuario;
  detalhes_calculo?: {
    entrada?: { turno_base: string; diff_minutos: number; tolerancia: number };
    saida?: { turno_base: string; diff_minutos: number; tolerancia: number };
  };
  saldo_minutos?: number | null;
}

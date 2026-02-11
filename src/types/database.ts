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

export interface Empresa {
  id: number;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  ativo: boolean;
  created_at?: string;
  codigo?: string; // Sigla (EE, ES, etc)
}

export interface Usuario {
  id: string; // UUID references auth.users
  perfil_id: number;
  cliente_id?: number | null;
  nome_completo: string;
  cpf: string;
  email: string;
  senha_padrao: boolean;
  status: 'PENDENTE' | 'ATIVO' | 'INATIVO';
  // ativo: boolean; // Deprecated
  created_at?: string;
  updated_at?: string;
  
  // Dados Pessoais Estendidos
  data_nascimento?: string;
  rg?: string;
  nome_mae?: string;
  endereco_completo?: string;
  telefone?: string;
  telefone_recado?: string;
  data_inicio?: string;

  // Dados Profissionais (Moto)
  cnh_registro?: string;
  cnh_vencimento?: string;
  cnh_categoria?: string;
  cnpj?: string;
  chave_pix?: string;
  moto_modelo?: string;
  moto_cor?: string;
  moto_ano?: string;
  moto_placa?: string;

  // Financeiro
  nome_operacao?: string;
  empresa_financeiro_id?: number | null;
  valor_contrato?: number;
  valor_aluguel?: number;
  valor_ajuda_custo?: number;
  valor_bonus?: number; // Zero Falta
  valor_mei?: number;

  // Relacionamentos (virtual)
  perfil?: Perfil;
  cliente?: Client; // Keeping Client as per original, assuming Cliente in snippet was a typo or future change
  empresa_id?: number | null; // Added Link
  empresa?: Empresa; // Aded Link
  turnos?: UsuarioTurno[];
  links?: ColaboradorCliente[];
}

export interface UsuarioTurno {
  id: number;
  usuario_id: string;
  hora_inicio: string; // TIME
  hora_fim: string; // TIME
  created_at?: string;
}

export interface ColaboradorCliente {
    id: number;
    colaborador_id: string;
    cliente_id: number;
    empresa_id: number;
    hora_inicio: string;
    hora_fim: string;
    valor_contrato?: number;
    valor_aluguel?: number;
    valor_bonus?: number;
    ajuda_custo?: number;
    mei?: boolean;
    // Virtual
    cliente?: Client;
    empresa?: Empresa;
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
    resumo?: { diff_km?: number; horas_trabalhadas?: string };
  };
  saldo_minutos?: number | null;
}

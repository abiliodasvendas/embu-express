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
  perfil_id: string; // "1", "2", "3"
  nome_completo: string;
  cpf: string;
  email: string;
  senha_padrao: boolean;
  status: 'PENDENTE' | 'ATIVO' | 'INATIVO';
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
  valor_ajuda_custo?: number;

  // Relacionamentos (virtual)
  perfil?: Perfil;
  cliente?: Client; 
  empresa?: Empresa; 
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
  entrada_hora: string; // TIMESTAMP WITH TIME ZONE
  entrada_km?: number | null;
  saida_hora?: string | null; // TIMESTAMP WITH TIME ZONE
  saida_km?: number | null;
  status_entrada?: string | null; // 'VERDE', 'AMARELO', 'VERMELHO', 'CINZA'
  status_saida?: string | null;
  observacao?: string | null;
  criado_por?: string | null; // UUID
  created_at?: string;
  updated_at?: string;
  cliente_id?: number | null;
  empresa_id?: number | null;
  entrada_loc?: any; // JSONB geolocalização
  saida_loc?: any; // JSONB geolocalização
  // Relacionamentos (virtual)
  usuario?: Usuario;
  detalhes_calculo?: {
    entrada?: { turno_base: string; diff_minutos: number; tolerancia: number };
    saida?: { turno_base: string; diff_minutos: number; tolerancia: number };
    resumo?: { diff_km?: number; horas_trabalhadas?: string };
  };
  saldo_minutos?: number | null;
}

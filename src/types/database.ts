export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
  total_colaboradores?: number;
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
  // Virtual
  cliente?: Client;
  empresa?: Empresa;
}

export interface Ponto {
  id: number; // BIGINT
  usuario_id: string; // UUID
  data_referencia: string; // DATE (YYYY-MM-DD)
  entrada_hora: string; // TIMESTAMP WITH TIME ZONE
  entrada_km?: number;
  saida_hora?: string; // TIMESTAMP WITH TIME ZONE
  saida_km?: number;
  status_entrada?: string; // 'VERDE', 'AMARELO', 'VERMELHO', 'CINZA'
  status_saida?: string;
  observacao?: string;
  criado_por?: string; // UUID
  created_at?: string;
  updated_at?: string;
  detalhes_calculo?: any;
  saldo_minutos?: number;
  cliente_id?: number;
  empresa_id?: number;

  // Novas colunas de localização
  entrada_lat?: number;
  entrada_lng?: number;
  entrada_metadata?: any;
  saida_lat?: number;
  saida_lng?: number;
  saida_metadata?: any;

  // Legado (serão removidos após migração completa)
  entrada_loc?: any;
  saida_loc?: any;

  // Joins
  cliente?: Partial<Client>;
  empresa?: Partial<Empresa>; // Added for consistency with empresa_id
  usuario?: Partial<Usuario>;
  pausas?: Pausa[];
}

export interface Pausa {
  id: number;
  ponto_id: number;
  inicio_hora: string;
  fim_hora?: string;
  inicio_km?: number;
  fim_km?: number;

  // Novas colunas de localização
  inicio_lat?: number;
  inicio_lng?: number;
  inicio_metadata?: any;
  fim_lat?: number;
  fim_lng?: number;
  fim_metadata?: any;

  // Legado
  inicio_loc?: any;
  fim_loc?: any;

  created_at?: string;
  updated_at?: string;
}export type RegistroPonto = Ponto;
export type RegistroPausa = Pausa;

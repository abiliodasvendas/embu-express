/**
 * Embu Express Database Types
 */

export interface Client {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  status: 'ativo' | 'inativo';
  endereco?: string;
  created_at?: string;
}

export interface Role {
  id: string;
  name: 'admin' | 'motoboy';
}

export interface Profile {
  id: string;
  nome_completo: string;
  cpf: string;
  role_id: string;
  cliente_atual_id?: string;
  horario_base_entrada?: string;
  horario_base_saida?: string;
  ativo: boolean;
  primeiro_acesso: boolean;
  created_at?: string;
}

export interface TimeRecord {
  id: string;
  profile_id: string;
  data_referencia: string;
  entrada_hora: string;
  saida_hora?: string;
  status_entrada?: string;
  status_saida?: string;
  created_at?: string;
}

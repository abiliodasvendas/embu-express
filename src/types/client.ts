/**
 * Embu Express - Domain Types
 */

export interface Client {
  id: number;
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

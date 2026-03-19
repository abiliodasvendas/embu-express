/**
 * Embu Express - Domain Types
 */

export interface Client {
  id: number;
  nome_fantasia: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

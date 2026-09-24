import { apiClient } from "./client";

export interface DreItem {
  descricao: string;
  valor: number;
  percentual?: number;
}

export interface DreConsolidado {
  periodo: { mes: number; ano: number };
  empresa_id?: number | null;
  empresa_nome?: string;
  faturamento_bruto: number;
  outras_receitas_operacionais: number;
  receita_operacional_total: number;
  custos_diretos: {
    total: number;
    custo_pessoal_folha: number;
    manutencao_frota_propria: number;
  };
  lucro_bruto: number;
  margem_bruta_percentual: number;
  despesas_fixas: {
    total: number;
    diretas: number;
    rateio_holding: number;
    itens: DreItem[];
  };
  tributos_correntes_das: {
    total: number;
    is_provisionado: boolean;
  };
  lucro_operacional: number;
  prolabore: number;
  parcelamentos_fiscais: number;
  investimentos_financiamentos: number;
  despesas_financeiras: number;
  lucro_liquido: number;
  margem_liquida_percentual: number;
}

export const dreApi = {
  getDRE: (mes: number, ano: number, empresaId?: number): Promise<DreConsolidado> =>
    apiClient.get("/dre", { params: { mes, ano, empresa_id: empresaId } }).then(res => res.data),
};

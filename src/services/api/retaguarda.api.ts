import { AlocacaoTemporaria } from "@/types/database";
import { apiClient } from "./client";

export interface MonitorReservaItem {
  colaborador_id: string;
  nome_completo: string;
  tipo_alocacao: "RESERVA" | "FISCAL";
  turno_descricao: string;
  salario_mensal: number;
  custo_diaria: number;
  dias_uteis_mes: number;
  dias_alocados: number;
  dias_ociosos: number;
  prejuizo_ociosidade: number;
}

export interface MonitorReservasResponse {
  totais: {
    total_reservas: number;
    total_fiscais: number;
    custo_total_retaguarda: number;
    prejuizo_total_ociosidade: number;
  };
  itens: MonitorReservaItem[];
}

export interface AlertaRiscoValeItem {
  colaborador_id: string;
  nome_completo: string;
  salario_base: number;
  vale_configurado: number;
  adiantamento_confirmado: boolean;
  valor_adiantamento_confirmado: number | null;
  valor_adiantamento_aplicado: number;
  faltas_1a_quinzena: number;
  valor_desconto_faltas: number;
  convenios_1a_quinzena: number;
  saldo_projetado_dia_07: number;
  nivel_risco: "NORMAL" | "RISCO_MEDIO" | "RISCO_ALTO" | "TRATADO_SEGURO" | "AJUSTADO_MARGEM_CRITICA";
  sugestao_vale_seguro: number;
}

export interface CriarAlocacaoPayload {
  reserva_id: string;
  titular_ausente_id?: string | null;
  cliente_id: number;
  unidade_id?: number | null;
  data_cobertura: string;
  observacao?: string | null;
}

export const retaguardaApi = {
  getMonitor: (mes: number, ano: number): Promise<MonitorReservasResponse> =>
    apiClient.get("/retaguarda/monitor", { params: { mes, ano } }).then(res => res.data),

  getAlertaVales: (mes: number, ano: number): Promise<AlertaRiscoValeItem[]> =>
    apiClient.get("/retaguarda/alerta-vales", { params: { mes, ano } }).then(res => res.data),

  listAlocacoes: (dataStr?: string): Promise<AlocacaoTemporaria[]> =>
    apiClient.get("/retaguarda/alocacoes", { params: { data: dataStr } }).then(res => res.data),

  criarAlocacao: (payload: CriarAlocacaoPayload): Promise<AlocacaoTemporaria> =>
    apiClient.post("/retaguarda/alocacoes", payload).then(res => res.data),
};

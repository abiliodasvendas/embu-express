import { apiClient } from "./client";

export interface PontoFluxoDia {
  dia: number;
  data: string;
  entradas_projetadas: number;
  entradas_realizadas: number;
  saidas_projetadas: number;
  saidas_realizadas: number;
  saldo_projetado_acumulado: number;
  saldo_realizado_acumulado: number;
  eventos: string[];
}

export interface FluxoCaixaResponse {
  periodo: { mes: number; ano: number };
  saldo_inicial: number;
  saldo_retido_convenios: number;
  total_entradas_projetadas: number;
  total_entradas_realizadas: number;
  total_saidas_projetadas: number;
  total_saidas_realizadas: number;
  saldo_final_projetado: number;
  saldo_final_realizado: number;
  curva_diaria: PontoFluxoDia[];
}

export const fluxoCaixaApi = {
  getFluxoCaixa: (mes: number, ano: number): Promise<FluxoCaixaResponse> =>
    apiClient.get("/fluxo-caixa", { params: { mes, ano } }).then(res => res.data),

  setSaldoInicial: (mes: number, ano: number, saldoInicial: number): Promise<any> =>
    apiClient.post("/fluxo-caixa/saldo-inicial", {
      mes,
      ano,
      saldo_inicial_consolidado: saldoInicial,
    }).then(res => res.data),
};

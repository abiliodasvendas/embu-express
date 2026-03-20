import { RegistroPonto, Pausa, PontoLocation } from "@/types/database";
import { EspelhoPontoMensal } from "@/types/ponto-relatorio";
import { apiClient } from "./client";

export const pontoApi = {
  listRegistros: (filtros?: Record<string, string | number | boolean | undefined>): Promise<RegistroPonto[]> =>
    apiClient.get(`/pontos`, { params: filtros }).then(res => res.data),

  createRegistro: (data: Partial<RegistroPonto>): Promise<RegistroPonto> =>
    apiClient.post(`/pontos`, data).then(res => res.data),

  updateRegistro: (id: number, data: Partial<RegistroPonto>): Promise<RegistroPonto> =>
    apiClient.put(`/pontos/${id}`, data).then(res => res.data),

  deleteRegistro: (id: number): Promise<void> =>
    apiClient.delete(`/pontos/${id}`).then(res => res.data),

  toggle: (data: { usuario_id: string; data_referencia?: string; hora?: string; km?: number; location?: PontoLocation; cliente_id?: number; empresa_id?: number; colaborador_cliente_id?: number }): Promise<RegistroPonto> =>
    apiClient.post(`/pontos/toggle`, data).then(res => res.data),

  iniciarPausa: (id: number, data: { inicio_hora?: string; inicio_km?: number; inicio_loc?: PontoLocation }): Promise<Pausa> =>
    apiClient.post(`/pontos/${id}/pausas`, data).then(res => res.data),

  finalizarPausa: (id: number, data: { fim_hora?: string; fim_km?: number; fim_loc?: PontoLocation }): Promise<Pausa> =>
    apiClient.put(`/pontos/pausas/${id}`, data).then(res => res.data),

  getRelatorioMensal: (usuarioId: string, mes: number, ano: number): Promise<RegistroPonto[]> =>
    apiClient.get(`/pontos/relatorio-mensal/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

  getEspelhoPonto: (usuarioId: string, mes: number, ano: number): Promise<EspelhoPontoMensal[]> =>
    apiClient.get(`/pontos/espelho-ponto/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

  getById: (id: number): Promise<RegistroPonto> =>
    apiClient.get(`/pontos/${id}`).then(res => res.data),
};

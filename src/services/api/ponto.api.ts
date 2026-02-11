import { RegistroPonto } from "@/types/database";
import { apiClient } from "./client";

export const pontoApi = {
  listRegistros: (filtros?: Record<string, any>): Promise<RegistroPonto[]> =>
    apiClient.get(`/pontos`, { params: filtros }).then(res => res.data),

  createRegistro: (data: Partial<RegistroPonto>): Promise<RegistroPonto> =>
    apiClient.post(`/pontos`, data).then(res => res.data),

  updateRegistro: (id: number, data: Partial<RegistroPonto>): Promise<RegistroPonto> =>
    apiClient.put(`/pontos/${id}`, data).then(res => res.data),

  deleteRegistro: (id: number): Promise<void> =>
    apiClient.delete(`/pontos/${id}`).then(res => res.data),

  toggle: (data: { usuario_id: string; data_referencia?: string; hora?: string; km?: number; localizacao?: string }): Promise<any> =>
    apiClient.post(`/pontos/toggle`, data).then(res => res.data),

  iniciarPausa: (id: number, data: { inicio_hora?: string; inicio_km?: number; inicio_loc?: string }): Promise<any> =>
    apiClient.post(`/pontos/${id}/pausas`, data).then(res => res.data),

  finalizarPausa: (id: number, data: { fim_hora?: string; fim_km?: number; fim_loc?: string }): Promise<any> =>
    apiClient.put(`/pontos/pausas/${id}`, data).then(res => res.data),
};

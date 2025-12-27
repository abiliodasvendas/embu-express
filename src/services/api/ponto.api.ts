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
};

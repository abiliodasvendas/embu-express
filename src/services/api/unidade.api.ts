import { Unidade } from "@/types/database";
import { apiClient } from "./client";

export const unidadeApi = {
  listUnidadesByCliente: (clienteId: number): Promise<Unidade[]> =>
    apiClient.get(`/unidades/cliente/${clienteId}`).then(res => res.data),

  getUnidade: (id: number): Promise<Unidade> =>
    apiClient.get(`/unidades/${id}`).then(res => res.data),

  createUnidade: (data: Partial<Unidade>): Promise<Unidade> =>
    apiClient.post(`/unidades`, data).then(res => res.data),

  updateUnidade: (id: number, data: Partial<Unidade>): Promise<Unidade> =>
    apiClient.put(`/unidades/${id}`, data).then(res => res.data),

  deleteUnidade: (id: number) =>
    apiClient.delete(`/unidades/${id}`).then(res => res.data),
};

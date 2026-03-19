import { Client } from "@/types/database";
import { apiClient } from "./client";

export const clienteApi = {
  listClientes: (filtros?: Record<string, string | number | boolean | undefined>): Promise<Client[]> =>
    apiClient.get(`/clientes`, { params: filtros }).then(res => res.data),

  getCliente: (id: number): Promise<Client> =>
    apiClient.get(`/clientes/${id}`).then(res => res.data),

  createCliente: (data: Partial<Client>): Promise<Client> =>
    apiClient.post(`/clientes`, data).then(res => res.data),

  updateCliente: (id: number, data: Partial<Client>): Promise<Client> =>
    apiClient.put(`/clientes/${id}`, data).then(res => res.data),

  toggleStatus: (id: number, novoStatus: boolean) =>
    apiClient.patch(`/clientes/${id}/toggle-ativo`, { novoStatus }).then(res => res.data),

  deleteCliente: (id: number) =>
    apiClient.delete(`/clientes/${id}`).then(res => res.data),
};

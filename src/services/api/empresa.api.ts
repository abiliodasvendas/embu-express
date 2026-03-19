import { Empresa } from "@/types/database";
import { apiClient } from "./client";

export const empresaApi = {
  listEmpresas: (filtros?: Record<string, string | number | boolean | undefined>): Promise<Empresa[]> =>
    apiClient.get(`/empresas`, { params: filtros }).then(res => res.data),

  getEmpresa: (id: number): Promise<Empresa> =>
    apiClient.get(`/empresas/${id}`).then(res => res.data),

  createEmpresa: (data: Partial<Empresa>): Promise<Empresa> =>
    apiClient.post(`/empresas`, data).then(res => res.data),

  updateEmpresa: (id: number, data: Partial<Empresa>): Promise<Empresa> =>
    apiClient.put(`/empresas/${id}`, data).then(res => res.data),

  toggleStatus: (id: number, novoStatus: boolean) =>
    apiClient.patch(`/empresas/${id}/toggle-ativo`, { novoStatus }).then(res => res.data),

  deleteEmpresa: (id: number) =>
    apiClient.delete(`/empresas/${id}`).then(res => res.data),
};

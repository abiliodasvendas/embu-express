import { apiClient } from "./client";

export const empresaApi = {
  listEmpresas: (filtros?: Record<string, any>) =>
    apiClient.get(`/empresas`, { params: filtros }).then(res => res.data),

  getEmpresa: (id: number) =>
    apiClient.get(`/empresas/${id}`).then(res => res.data),

  createEmpresa: (data: any) =>
    apiClient.post(`/empresas`, data).then(res => res.data),

  updateEmpresa: (id: number, data: any) =>
    apiClient.put(`/empresas/${id}`, data).then(res => res.data),

  toggleStatus: (id: number, novoStatus: boolean) =>
    apiClient.patch(`/empresas/${id}/toggle-ativo`, { novoStatus }).then(res => res.data),

  deleteEmpresa: (id: number) =>
    apiClient.delete(`/empresas/${id}`).then(res => res.data),
};

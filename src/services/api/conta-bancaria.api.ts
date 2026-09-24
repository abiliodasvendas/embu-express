import { ContaBancaria } from "@/types/database";
import { apiClient } from "./client";

export const contaBancariaApi = {
  list: (empresaId?: number): Promise<ContaBancaria[]> =>
    apiClient.get("/contas-bancarias", { params: { empresa_id: empresaId } }).then(res => res.data),

  getById: (id: string): Promise<ContaBancaria> =>
    apiClient.get(`/contas-bancarias/${id}`).then(res => res.data),

  create: (data: Partial<ContaBancaria>): Promise<ContaBancaria> =>
    apiClient.post("/contas-bancarias", data).then(res => res.data),

  update: (id: string, data: Partial<ContaBancaria>): Promise<ContaBancaria> =>
    apiClient.put(`/contas-bancarias/${id}`, data).then(res => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/contas-bancarias/${id}`).then(res => res.data),
};

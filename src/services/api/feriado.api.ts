import { apiClient } from "./client";

export const feriadoApi = {
  listFeriados: (ano?: number) =>
    apiClient.get(`/feriados`, { params: { ano } }).then(res => res.data),

  createFeriado: (data: { data: string; descricao: string }) =>
    apiClient.post(`/feriados`, data).then(res => res.data),

  updateFeriado: (id: number, data: { data: string; descricao: string }) =>
    apiClient.put(`/feriados/${id}`, data).then(res => res.data),

  deleteFeriado: (id: number) =>
    apiClient.delete(`/feriados/${id}`).then(res => res.data),
};

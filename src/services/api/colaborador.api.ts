import { Perfil, Usuario, ColaboradorCliente } from "@/types/database";
import { apiClient } from "./client";

export const colaboradorApi = {
  listColaboradores: (filtros?: Record<string, any>): Promise<Usuario[]> =>
    apiClient.get(`/usuarios`, { params: filtros }).then(res => res.data),

  getColaborador: (id: string): Promise<Usuario> =>
    apiClient.get(`/usuarios/${id}`).then(res => res.data),

  createColaborador: (data: Partial<Usuario> & { turnos?: Partial<ColaboradorCliente>[] }): Promise<Usuario> =>
    apiClient.post(`/usuarios`, data).then(res => res.data),

  updateColaborador: (id: string, data: Partial<Usuario> & { turnos?: Partial<ColaboradorCliente>[] }): Promise<Usuario> =>
    apiClient.put(`/usuarios/${id}`, data).then(res => res.data),

  updateStatus: (id: string, status: string): Promise<{ status: string }> =>
    apiClient.patch(`/usuarios/${id}/status`, { status }).then(res => res.data),

  resetPassword: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.post(`/usuarios/${id}/reset-password`).then(res => res.data),

  deleteColaborador: (id: string): Promise<void> =>
    apiClient.delete(`/usuarios/${id}`).then(res => res.data),

  listPerfis: (): Promise<Perfil[]> =>
    apiClient.get(`/perfis`).then(res => res.data),

  listPublicPerfis: (): Promise<Perfil[]> =>
    apiClient.get(`/perfis/publico`).then(res => res.data),

  listTurnos: (usuarioId: string): Promise<ColaboradorCliente[]> =>
    apiClient.get(`/usuarios/${usuarioId}/turnos`).then(res => res.data),

  createVinculo: (data: Partial<ColaboradorCliente>): Promise<ColaboradorCliente> =>
    apiClient.post(`/usuarios/vinculos`, data).then(res => res.data),

  updateVinculo: (id: number, data: Partial<ColaboradorCliente>): Promise<ColaboradorCliente> =>
    apiClient.put(`/usuarios/vinculos/${id}`, data).then(res => res.data),

  deleteVinculo: (id: number): Promise<void> =>
    apiClient.delete(`/usuarios/vinculos/${id}`).then(res => res.data),
};

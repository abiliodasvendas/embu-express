import { Perfil, Usuario, UsuarioTurno } from "@/types/database";
import { apiClient } from "./client";

export const funcionarioApi = {
  listFuncionarios: (filtros?: Record<string, any>): Promise<Usuario[]> =>
    apiClient.get(`/usuarios`, { params: filtros }).then(res => res.data),

  createFuncionario: (data: Partial<Usuario> & { turnos?: Partial<UsuarioTurno>[] }): Promise<Usuario> =>
    apiClient.post(`/usuarios`, data).then(res => res.data),

  updateFuncionario: (id: string, data: Partial<Usuario> & { turnos?: Partial<UsuarioTurno>[] }): Promise<Usuario> =>
    apiClient.put(`/usuarios/${id}`, data).then(res => res.data),

  toggleStatus: (id: string, novoStatus: boolean): Promise<{ ativo: boolean }> =>
    apiClient.patch(`/usuarios/${id}/toggle-ativo`, { novoStatus }).then(res => res.data),

  deleteFuncionario: (id: string): Promise<void> =>
    apiClient.delete(`/usuarios/${id}`).then(res => res.data),
    
  listPerfis: (): Promise<Perfil[]> =>
    apiClient.get(`/perfis`).then(res => res.data),

  // Gestão de Turnos
  listTurnos: (usuarioId: string): Promise<UsuarioTurno[]> =>
    apiClient.get(`/usuarios/${usuarioId}/turnos`).then(res => res.data),
};

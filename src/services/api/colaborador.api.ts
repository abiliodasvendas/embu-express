import { Perfil, Usuario, UsuarioTurno } from "@/types/database";
import { apiClient } from "./client";

export const colaboradorApi = {
  listColaboradores: (filtros?: Record<string, any>): Promise<Usuario[]> =>
    apiClient.get(`/usuarios`, { params: filtros }).then(res => res.data),

  getColaborador: (id: string): Promise<Usuario> =>
    apiClient.get(`/usuarios/${id}`).then(res => res.data),

  createColaborador: (data: Partial<Usuario> & { turnos?: Partial<UsuarioTurno>[] }): Promise<Usuario> =>
    apiClient.post(`/usuarios`, data).then(res => res.data),

  updateColaborador: (id: string, data: Partial<Usuario> & { turnos?: Partial<UsuarioTurno>[] }): Promise<Usuario> =>
    apiClient.put(`/usuarios/${id}`, data).then(res => res.data),

  updateStatus: (id: string, status: string): Promise<{ status: string }> =>
    apiClient.patch(`/usuarios/${id}/status`, { status }).then(res => res.data),

  deleteColaborador: (id: string): Promise<void> =>
    apiClient.delete(`/usuarios/${id}`).then(res => res.data),
    
  listPerfis: (): Promise<Perfil[]> =>
    apiClient.get(`/perfis`).then(res => res.data),

  // Gestão de Vínculos (Turnos)
  listTurnos: (usuarioId: string): Promise<UsuarioTurno[]> =>
    apiClient.get(`/usuarios/${usuarioId}/turnos`).then(res => res.data),

  createVinculo: (data: {
    colaborador_id: string;
    cliente_id: number;
    empresa_id: number;
    hora_inicio: string;
    hora_fim: string;
    valor_contrato?: number;
    valor_aluguel?: number;
    valor_bonus?: number;
    ajuda_custo?: number;
    mei?: boolean;
  }): Promise<any> =>
    apiClient.post(`/usuarios/vinculos`, data).then(res => res.data),

  updateVinculo: (id: number, data: any): Promise<any> =>
    apiClient.put(`/usuarios/vinculos/${id}`, data).then(res => res.data),

  deleteVinculo: (id: number): Promise<void> =>
    apiClient.delete(`/usuarios/vinculos/${id}`).then(res => res.data),
};

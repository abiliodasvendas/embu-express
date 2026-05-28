import { apiClient } from "./client";
import { CategoriaItem, ItemEquipamento, ColaboradorItem } from "@/types/database";

export const itemEquipamentoApi = {
  listCategorias: (): Promise<CategoriaItem[]> =>
    apiClient.get("/itens-equipamentos/categorias").then((res) => res.data),

  createCategoria: (data: { nome: string }): Promise<CategoriaItem> =>
    apiClient.post("/itens-equipamentos/categorias", data).then((res) => res.data),

  updateCategoria: (id: number, data: { nome: string }): Promise<CategoriaItem> =>
    apiClient.put(`/itens-equipamentos/categorias/${id}`, data).then((res) => res.data),

  deleteCategoria: (id: number): Promise<{ success: boolean }> =>
    apiClient.delete(`/itens-equipamentos/categorias/${id}`).then((res) => res.data),

  listItens: (): Promise<ItemEquipamento[]> =>
    apiClient.get("/itens-equipamentos").then((res) => res.data),

  createItem: (data: { nome: string; categoria_id: number; ativo: boolean }): Promise<ItemEquipamento> =>
    apiClient.post("/itens-equipamentos", data).then((res) => res.data),

  updateItem: (id: number, data: { nome: string; categoria_id: number; ativo: boolean }): Promise<ItemEquipamento> =>
    apiClient.put(`/itens-equipamentos/${id}`, data).then((res) => res.data),

  deleteItem: (id: number): Promise<{ success: boolean }> =>
    apiClient.delete(`/itens-equipamentos/${id}`).then((res) => res.data),

  associarItens: (data: { colaborador_id: string; itens_ids: number[]; observacao?: string | null }): Promise<ColaboradorItem[]> =>
    apiClient.post("/itens-equipamentos/alocar", data).then((res) => res.data),

  listAlocadosPorItem: (id: number): Promise<ColaboradorItem[]> =>
    apiClient.get(`/itens-equipamentos/${id}/colaboradores`).then((res) => res.data),

  listItensColaborador: (id: string): Promise<ColaboradorItem[]> =>
    apiClient.get(`/itens-equipamentos/colaborador/${id}`).then((res) => res.data),

  desassociarItem: (id: number): Promise<{ success: boolean }> =>
    apiClient.delete(`/itens-equipamentos/alocacao/${id}`).then((res) => res.data),

  desassociarTodosItens: (colaboradorId: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/itens-equipamentos/alocacao/colaborador/${colaboradorId}`).then((res) => res.data),
};

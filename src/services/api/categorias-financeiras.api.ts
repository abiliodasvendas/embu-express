import {
  CategoriaFinanceira,
  EscopoCategoriaFinanceira,
  GrupoDreCategoriaFinanceira,
} from "@/types/database";
import { apiClient } from "./client";

export interface CreateCategoriaFinanceiraPayload {
  nome: string;
  escopo: EscopoCategoriaFinanceira;
  grupo_dre: GrupoDreCategoriaFinanceira;
}

export interface UpdateCategoriaFinanceiraPayload {
  nome?: string;
  grupo_dre?: GrupoDreCategoriaFinanceira;
  ativo?: boolean;
}

export interface ListCategoriasFinanceirasFiltros {
  escopo?: EscopoCategoriaFinanceira;
  apenas_ativas?: boolean;
}

export const categoriasFinanceirasApi = {
  list: (filtros?: ListCategoriasFinanceirasFiltros): Promise<CategoriaFinanceira[]> =>
    apiClient
      .get("/categorias-financeiras", {
        params: filtros
          ? {
              ...(filtros.escopo ? { escopo: filtros.escopo } : {}),
              ...(filtros.apenas_ativas !== undefined
                ? { apenas_ativas: String(filtros.apenas_ativas) }
                : {}),
            }
          : undefined,
      })
      .then((res) => res.data),

  create: (data: CreateCategoriaFinanceiraPayload): Promise<CategoriaFinanceira> =>
    apiClient.post("/categorias-financeiras", data).then((res) => res.data),

  update: (
    id: string,
    data: UpdateCategoriaFinanceiraPayload
  ): Promise<CategoriaFinanceira> =>
    apiClient.put(`/categorias-financeiras/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/categorias-financeiras/${id}`).then((res) => res.data),
};

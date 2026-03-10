import { apiClient } from "./client";
import { Ocorrencia, TipoOcorrencia } from "@/types/database";

export const ocorrenciaService = {
    async listOcorrencias(filtros?: {
        usuario_id?: string;
        colaborador_cliente_id?: number;
        data_inicio?: string;
        data_fim?: string;
        order?: string;
        ascending?: boolean;
    }) {
        const params = new URLSearchParams();
        if (filtros?.usuario_id) params.append("usuario_id", filtros.usuario_id);
        if (filtros?.colaborador_cliente_id) params.append("colaborador_cliente_id", filtros.colaborador_cliente_id.toString());
        if (filtros?.data_inicio) params.append("data_inicio", filtros.data_inicio);
        if (filtros?.data_fim) params.append("data_fim", filtros.data_fim);
        if (filtros?.order) params.append("order", filtros.order);
        if (filtros?.ascending !== undefined) params.append("ascending", filtros.ascending.toString());

        const response = await apiClient.get<Ocorrencia[]>(`/ocorrencias?${params.toString()}`);
        return response.data;
    },

    async listTiposOcorrencia() {
        const response = await apiClient.get<TipoOcorrencia[]>("/ocorrencias/tipos");
        return response.data;
    },

    async createOcorrencia(data: Partial<Ocorrencia>) {
        const response = await apiClient.post<Ocorrencia>("/ocorrencias", data);
        return response.data;
    },

    async updateOcorrencia(id: number, data: Partial<Ocorrencia>) {
        const response = await apiClient.put<Ocorrencia>(`/ocorrencias/${id}`, data);
        return response.data;
    },

    async createTipoOcorrencia(data: Partial<TipoOcorrencia>) {
        const response = await apiClient.post<TipoOcorrencia>("/ocorrencias/tipos", data);
        return response.data;
    },

    async updateTipoOcorrencia(id: number, data: Partial<TipoOcorrencia>) {
        const response = await apiClient.put<TipoOcorrencia>(`/ocorrencias/tipos/${id}`, data);
        return response.data;
    },

    async deleteTipoOcorrencia(id: number) {
        const response = await apiClient.delete(`/ocorrencias/tipos/${id}`);
        return response.data;
    },

    async deleteOcorrencia(id: number) {
        const response = await apiClient.delete(`/ocorrencias/${id}`);
        return response.data;
    }
};

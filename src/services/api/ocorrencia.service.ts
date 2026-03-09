import { apiClient } from "./client";
import { Ocorrencia, TipoOcorrencia } from "@/types/database";

export const ocorrenciaService = {
    async listOcorrencias(filtros?: {
        usuario_id?: string;
        colaborador_cliente_id?: number;
        data_inicio?: string;
        data_fim?: string;
    }) {
        const params = new URLSearchParams();
        if (filtros?.usuario_id) params.append("usuario_id", filtros.usuario_id);
        if (filtros?.colaborador_cliente_id) params.append("colaborador_cliente_id", filtros.colaborador_cliente_id.toString());
        if (filtros?.data_inicio) params.append("data_inicio", filtros.data_inicio);
        if (filtros?.data_fim) params.append("data_fim", filtros.data_fim);

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
        const response = await apiClient.patch<Ocorrencia>(`/ocorrencias/${id}`, data);
        return response.data;
    },

    async deleteOcorrencia(id: number) {
        const response = await apiClient.delete(`/ocorrencias/${id}`);
        return response.data;
    }
};

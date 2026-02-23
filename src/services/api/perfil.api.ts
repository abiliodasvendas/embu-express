import { Perfil } from "@/types/database";
import { Permissao } from "@/types/permissao";
import { api } from "./client";

export const perfilApi = {
    getAll: async () => {
        const response = await api.get<Perfil[]>('/perfis');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Perfil>(`/perfis/${id}`);
        return response.data;
    },

    create: async (data: Partial<Perfil> & { permissoes?: number[] }) => {
        const response = await api.post<Perfil>('/perfis', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Perfil> & { permissoes?: number[] }) => {
        const response = await api.put<Perfil>(`/perfis/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/perfis/${id}`);
        return response.data;
    },

    listPermissoes: async () => {
        const response = await api.get<Permissao[]>('/perfis/permissoes/lista');
        return response.data;
    }
};

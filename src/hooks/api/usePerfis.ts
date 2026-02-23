import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { perfilApi } from "../../services/api/perfil.api";
import { Perfil } from "../../types/database";

export function usePerfis() {
    return useQuery({
        queryKey: ['perfis'],
        queryFn: perfilApi.getAll
    });
}

export function usePerfil(id?: number) {
    return useQuery({
        queryKey: ['perfis', id],
        queryFn: () => perfilApi.getById(id!),
        enabled: !!id
    });
}

export function usePermissoes() {
    return useQuery({
        queryKey: ['permissoes'],
        queryFn: perfilApi.listPermissoes
    });
}

export function useCreatePerfil() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: perfilApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perfis'] });
        }
    });
}

export function useUpdatePerfil() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Perfil> & { permissoes?: number[] } }) =>
            perfilApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perfis'] });
        }
    });
}

export function useDeletePerfil() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: perfilApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perfis'] });
        }
    });
}

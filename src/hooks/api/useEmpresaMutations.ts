import { messages } from "@/constants/messages";
import { empresaApi } from "@/services/api/empresa.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmpresaFormValues } from "@/schemas/empresaSchema";
import { ApiError } from "@/types/api";
import { onlyNumbers } from "@/utils/string";

export interface CreateEmpresaVariables extends EmpresaFormValues {
  silent?: boolean;
}

export interface UpdateEmpresaVariables extends EmpresaFormValues {
  id: number;
  silent?: boolean;
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: CreateEmpresaVariables) => {
      const { silent, ...data } = variables;
      const empresaData = {
        ...data,
        cnpj: onlyNumbers(data.cnpj)
      };
      return empresaApi.createEmpresa(empresaData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      if (!variables.silent) {
        toast.success(messages.empresa.sucesso.criada);
      }
    },
    onError: (error: ApiError, variables) => {
      if (!variables.silent) {
        toast.error(messages.empresa.erro.criar, {
          description: error.response?.data?.error || error.response?.data?.message || error.message,
        });
      }
    },
  });
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: UpdateEmpresaVariables) => {
      const { id, silent, ...data } = variables;
      const empresaData = {
        ...data,
        cnpj: onlyNumbers(data.cnpj)
      };
      return empresaApi.updateEmpresa(id, empresaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      toast.success(messages.empresa.sucesso.atualizada);
    },
    onError: (error: ApiError, variables) => {
      if (!variables.silent) {
        toast.error(messages.empresa.erro.atualizar, {
          description: error.response?.data?.error || error.response?.data?.message || error.message,
        });
      }
    },
  });
}

export function useToggleEmpresaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      empresaApi.toggleStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success(messages.empresa.sucesso.status);
    },
    onError: (error: ApiError) => {
      toast.error(messages.empresa.erro.status, {
        description: error.response?.data?.error || error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => empresaApi.deleteEmpresa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      // Invalidate collaborators as they might be unlinked
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      toast.success(messages.empresa.sucesso.excluida);
    },
    onError: (error: ApiError) => {
      toast.error(messages.empresa.erro.excluir, {
        description: error.response?.data?.error || error.response?.data?.message || error.message,
      });
    },
  });
}

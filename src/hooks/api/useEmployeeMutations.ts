import { messages } from "@/constants/messages";
import { funcionarioApi } from "@/services/api/funcionario.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...employeeData } = data;
      return funcionarioApi.createFuncionario(employeeData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-combo"] });
      if (!variables.silent) {
        toast.success(messages.funcionario.sucesso.criado);
      }
    },
    onError: (error: any) => {
      toast.error(messages.funcionario.erro.criar, {
        description: error.message,
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => funcionarioApi.updateFuncionario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-combo"] });
      toast.success(messages.funcionario.sucesso.atualizado);
    },
    onError: (error: any) => {
      toast.error(messages.funcionario.erro.atualizar, {
        description: error.message,
      });
    },
  });
}

export function useToggleEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => 
      funcionarioApi.toggleStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-combo"] });
      toast.success(messages.funcionario.sucesso.status);
    },
    onError: (error: any) => {
      toast.error(messages.funcionario.erro.toggleStatus, {
        description: error.message,
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => funcionarioApi.deleteFuncionario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-employees-combo"] });
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.funcionario.sucesso.excluido);
    },
    onError: (error: any) => {
      toast.error(messages.funcionario.erro.excluir, {
        description: error.message,
      });
    },
  });
}

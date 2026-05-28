import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemEquipamentoApi } from "@/services/api/itemEquipamento.api";
import { messages } from "@/constants/messages";
import { toast } from "@/utils/notifications/toast";
import { ApiError } from "@/types/api";

export function useCategoriasQuery() {
  return useQuery({
    queryKey: ["itens-equipamentos", "categorias"],
    queryFn: () => itemEquipamentoApi.listCategorias(),
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { nome: string }) => itemEquipamentoApi.createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      toast.success(messages.itemEquipamento.sucesso.categoria.criado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.categoria.criar, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) =>
      itemEquipamentoApi.updateCategoria(id, { nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      toast.success(messages.itemEquipamento.sucesso.categoria.atualizado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.categoria.atualizar, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => itemEquipamentoApi.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      toast.success(messages.itemEquipamento.sucesso.categoria.excluido);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.categoria.excluir, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useItensQuery() {
  return useQuery({
    queryKey: ["itens-equipamentos", "lista"],
    queryFn: () => itemEquipamentoApi.listItens(),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { nome: string; categoria_id: number; ativo: boolean }) =>
      itemEquipamentoApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success(messages.itemEquipamento.sucesso.criado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.criar, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; nome: string; categoria_id: number; ativo: boolean }) =>
      itemEquipamentoApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success(messages.itemEquipamento.sucesso.atualizado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.atualizar, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => itemEquipamentoApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success(messages.itemEquipamento.sucesso.excluido);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.excluir, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useAlocadosPorItemQuery(itemId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["itens-equipamentos", "alocados", itemId],
    queryFn: () => itemEquipamentoApi.listAlocadosPorItem(itemId),
    enabled: !!itemId && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useAssociarItens() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { colaborador_id: string; itens_ids: number[]; observacao?: string | null }) =>
      itemEquipamentoApi.associarItens(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success(messages.itemEquipamento.sucesso.alocado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.itemEquipamento.erro.alocar, {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDesassociarItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => itemEquipamentoApi.desassociarItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success("Item devolvido com sucesso!");
    },
    onError: (error: ApiError) => {
      toast.error("Erro ao devolver item", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDesassociarTodosItens() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (colaboradorId: string) => itemEquipamentoApi.desassociarTodosItens(colaboradorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["itens-equipamentos", "lista"] });
      toast.success("Todos os itens foram devolvidos com sucesso!");
    },
    onError: (error: ApiError) => {
      toast.error("Erro ao devolver itens", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useItensColaboradorQuery(colaboradorId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["itens-equipamentos", "colaborador", colaboradorId],
    queryFn: () => itemEquipamentoApi.listItensColaborador(colaboradorId),
    enabled: !!colaboradorId && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

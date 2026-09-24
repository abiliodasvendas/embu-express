import { contaBancariaApi } from "@/services/api/conta-bancaria.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContaBancaria } from "@/types/database";

export function useContasBancarias(empresaId?: number) {
  const queryClient = useQueryClient();

  const query = useQuery<ContaBancaria[]>({
    queryKey: ["contas-bancarias", empresaId],
    queryFn: () => contaBancariaApi.list(empresaId),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ContaBancaria>) => contaBancariaApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContaBancaria> }) =>
      contaBancariaApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contaBancariaApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] }),
  });

  return {
    ...query,
    contas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

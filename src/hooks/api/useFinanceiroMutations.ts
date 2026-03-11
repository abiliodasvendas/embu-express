import { getMessage } from "@/constants/messages";
import { financeiroApi } from "@/services/api/financeiro.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFinanceiroMutations() {
    const queryClient = useQueryClient();

    const handlePaymentMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.processarPagamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", variables.usuarioId, variables.mes, variables.ano] });
            toast.success(getMessage("financeiro.sucesso.pago"));
        },
        onError: (error: any) => {
            toast.error(getMessage("financeiro.erro.registrarPagamento"), { description: error.message });
        }
    });

    return {
        handlePaymentMutation,
    };
}

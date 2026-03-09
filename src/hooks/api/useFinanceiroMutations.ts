import { financeiroApi } from "@/services/api/financeiro.api";
import { getMessage } from "@/constants/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFinanceiroMutations() {
    const queryClient = useQueryClient();

    const closeMonthMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.confirmarFechamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", variables.usuarioId, variables.mes, variables.ano] });
            toast.success(getMessage("financeiro.sucesso.fechado"));
        },
        onError: (error: any) => {
            toast.error(getMessage("financeiro.erro.fecharMes"), { description: error.message });
        }
    });

    const markAsPaidMutation = useMutation({
        mutationFn: (id: number) => financeiroApi.marcarComoPago(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
            toast.success(getMessage("financeiro.sucesso.pago"));
        },
        onError: (error: any) => {
            toast.error(getMessage("financeiro.erro.registrarPagamento"), { description: error.message });
        }
    });

    return {
        closeMonthMutation,
        markAsPaidMutation,
    };
}

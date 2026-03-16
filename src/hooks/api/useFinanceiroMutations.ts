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

    const confirmarAdiantamentoMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.confirmarAdiantamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", variables.usuarioId, variables.mes, variables.ano] });
            toast.success("Adiantamentos confirmados com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao confirmar adiantamento", { description: error.message });
        }
    });

    const desconfirmarAdiantamentoMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.desconfirmarAdiantamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", variables.usuarioId, variables.mes, variables.ano] });
            toast.success("Confirmação de adiantamentos removida!");
        },
        onError: (error: any) => {
            toast.error("Erro ao remover confirmação", { description: error.message });
        }
    });

    const desfazerPagamentoMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.desfazerPagamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", variables.usuarioId, variables.mes, variables.ano] });
            toast.success("Pagamento desfeito com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao desfazer pagamento", { description: error.message });
        }
    });

    return {
        handlePaymentMutation,
        confirmarAdiantamentoMutation,
        desconfirmarAdiantamentoMutation,
        desfazerPagamentoMutation
    };
}

import { getMessage } from "@/constants/messages";
import { financeiroApi } from "@/services/api/financeiro.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export function useFinanceiroMutations() {
    const queryClient = useQueryClient();

    const invalidateFinanceiroQueries = (usuarioId: string, mes: number, ano: number) => {
        queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", usuarioId, mes, ano] });
        queryClient.invalidateQueries({ queryKey: ["financeiro-status-geral"] });
        queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
        queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
        queryClient.invalidateQueries({ queryKey: ["conta-bancaria-extrato"] });
        queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
        queryClient.invalidateQueries({ queryKey: ["dre"] });
    };

    const handlePaymentMutation = useMutation({
        mutationFn: ({
            usuarioId,
            mes,
            ano,
            contaBancariaId,
            dataPagamento,
        }: {
            usuarioId: string;
            mes: number;
            ano: number;
            contaBancariaId?: string | null;
            dataPagamento?: string | null;
        }) => financeiroApi.processarPagamento(usuarioId, mes, ano, contaBancariaId, dataPagamento),
        onSuccess: (_, variables) => {
            invalidateFinanceiroQueries(variables.usuarioId, variables.mes, variables.ano);
            toast.success(getMessage("financeiro.sucesso.pago"));
        },
        onError: (error: ApiError) => {
            toast.error(getMessage("financeiro.erro.registrarPagamento"), {
                description: error.response?.data?.error || error.message,
            });
        },
    });

    const confirmarAdiantamentoMutation = useMutation({
        mutationFn: ({
            usuarioId,
            mes,
            ano,
            valor,
            contaBancariaId,
            dataPagamento,
        }: {
            usuarioId: string;
            mes: number;
            ano: number;
            valor?: number;
            contaBancariaId?: string | null;
            dataPagamento?: string | null;
        }) => financeiroApi.confirmarAdiantamento(usuarioId, mes, ano, valor, contaBancariaId, dataPagamento),
        onSuccess: (_, variables) => {
            invalidateFinanceiroQueries(variables.usuarioId, variables.mes, variables.ano);
            toast.success("Adiantamento confirmado com sucesso!");
        },
        onError: (error: ApiError) => {
            toast.error("Erro ao confirmar adiantamento", {
                description: error.response?.data?.error || error.message,
            });
        },
    });

    const desconfirmarAdiantamentoMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.desconfirmarAdiantamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            invalidateFinanceiroQueries(variables.usuarioId, variables.mes, variables.ano);
            toast.success("Confirmação de adiantamento removida!");
        },
        onError: (error: ApiError) => {
            toast.error("Erro ao remover confirmação", {
                description: error.response?.data?.error || error.message,
            });
        },
    });

    const desfazerPagamentoMutation = useMutation({
        mutationFn: ({ usuarioId, mes, ano }: { usuarioId: string; mes: number; ano: number }) =>
            financeiroApi.desfazerPagamento(usuarioId, mes, ano),
        onSuccess: (_, variables) => {
            invalidateFinanceiroQueries(variables.usuarioId, variables.mes, variables.ano);
            toast.success("Pagamento desfeito com sucesso!");
        },
        onError: (error: ApiError) => {
            toast.error("Erro ao desfazer pagamento", {
                description: error.response?.data?.error || error.message,
            });
        },
    });

    return {
        handlePaymentMutation,
        confirmarAdiantamentoMutation,
        desconfirmarAdiantamentoMutation,
        desfazerPagamentoMutation,
    };
}

import { financeiroApi, StatusGeralFechamento } from "@/services/api/financeiro.api";
import { useQuery } from "@tanstack/react-query";

export function useFinanceiro(usuarioId: string | undefined, mes: number, ano: number) {
    return useQuery({
        queryKey: ["financeiro-extrato", usuarioId, mes, ano],
        queryFn: () => financeiroApi.getExtratoMensal(usuarioId!, mes, ano),
        enabled: !!usuarioId && !!mes && !!ano,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
}

export function useFinanceiroGeral(mes: number, ano: number, enabled: boolean = true) {
    return useQuery<StatusGeralFechamento[]>({
        queryKey: ["financeiro-status-geral", mes, ano],
        queryFn: () => financeiroApi.getStatusGeral(mes, ano),
        enabled: !!mes && !!ano && enabled,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
}

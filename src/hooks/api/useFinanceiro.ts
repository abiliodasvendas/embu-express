import { financeiroApi } from "@/services/api/financeiro.api";
import { useQuery } from "@tanstack/react-query";

export function useFinanceiro(usuarioId: string | undefined, mes: number, ano: number) {
    return useQuery({
        queryKey: ["financeiro-extrato", usuarioId, mes, ano],
        queryFn: () => financeiroApi.getExtratoMensal(usuarioId!, mes, ano),
        enabled: !!usuarioId && !!mes && !!ano,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

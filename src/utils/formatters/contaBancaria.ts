import { ContaBancaria } from "@/types/database";

export function formatContaBancaria(
  conta?: Partial<ContaBancaria> | null,
  fallbackEmpresaNome?: string
): string {
  if (!conta) return "-";
  const banco = conta.banco_nome || "Conta";
  const empresa =
    conta.empresa?.nome_fantasia ||
    fallbackEmpresaNome ||
    (conta.empresa_id ? `Empresa #${conta.empresa_id}` : "Empresa");
  return `${banco} - ${empresa}`;
}

import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";
import type { StatusDespesa } from "@/types/database";

export function getDespesaAtrasoInfo(
  dataVencimento: string,
  status: StatusDespesa,
): { isVencido: boolean; diasAtraso: number } {
  const hojeStr = toLocalDateString();
  const isVencido =
    status === STATUS_DESPESA.PENDENTE && dataVencimento < hojeStr;

  let diasAtraso = 0;
  if (isVencido) {
    const venc = new Date(`${dataVencimento}T12:00:00Z`);
    const diffMs = new Date().getTime() - venc.getTime();
    diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  return { isVencido, diasAtraso };
}

export function getDespesaTipoTexto(
  isRecorrente?: boolean | null,
  totalParcelas?: number | null,
  numeroParcela?: number | null,
): string {
  if (isRecorrente) {
    return "Fixa Mensal";
  }
  if ((totalParcelas ?? 0) > 1) {
    return `Parcela ${numeroParcela || 1}/${totalParcelas}`;
  }
  return "Única";
}

export function isPrevisaoFixa(id: string): boolean {
  return id.startsWith("prev_desp_");
}

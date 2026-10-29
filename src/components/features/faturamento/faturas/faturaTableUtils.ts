import { STATUS_FATURA, TIPO_PERIODO_FATURA } from "@/constants/financeiro.constants";
import type { FaturaCliente, FaturaRecebimento, StatusFatura } from "@/types/database";

export function getFaturaAtrasoInfo(
  dataVencimento: string,
  status: StatusFatura,
): { isVencido: boolean; diasAtraso: number } {
  const hojeStr = new Date().toISOString().split("T")[0];
  const isVencido =
    status !== STATUS_FATURA.LIQUIDADA &&
    status !== STATUS_FATURA.CANCELADA &&
    dataVencimento < hojeStr;

  let diasAtraso = 0;
  if (isVencido) {
    const venc = new Date(`${dataVencimento}T12:00:00Z`);
    const diffMs = new Date().getTime() - venc.getTime();
    diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  return { isVencido, diasAtraso };
}

export function getFaturaPeriodoTexto(
  tipoPeriodo?: string,
  numeroPeriodo?: number | null,
  quinzena?: number | null,
): string {
  if (tipoPeriodo === TIPO_PERIODO_FATURA.MENSAL) {
    return "Mensal";
  }
  if (tipoPeriodo === TIPO_PERIODO_FATURA.SEMANAL) {
    return `${numeroPeriodo || 1}ª Semana`;
  }
  return `${numeroPeriodo || quinzena || 1}ª Quinzena`;
}

export interface FaturaPagamentoInfo {
  temPagamento: boolean;
  quantidadeBaixas: number;
  ultimaData?: string;
  recebimentos: FaturaRecebimento[];
}

export function getFaturaPagamentoInfo(recebimentos?: FaturaRecebimento[]): FaturaPagamentoInfo {
  if (!recebimentos || recebimentos.length === 0) {
    return {
      temPagamento: false,
      quantidadeBaixas: 0,
      recebimentos: [],
    };
  }

  const sorted = [...recebimentos].sort((a, b) =>
    (b.data_recebimento || "").localeCompare(a.data_recebimento || "")
  );

  return {
    temPagamento: true,
    quantidadeBaixas: sorted.length,
    ultimaData: sorted[0]?.data_recebimento,
    recebimentos: sorted,
  };
}

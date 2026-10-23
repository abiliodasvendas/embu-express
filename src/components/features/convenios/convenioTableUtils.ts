import { FaturaFornecedorPagamento } from "@/types/database";

export interface ConvenioPagamentoItem {
  id?: string;
  data_pagamento: string;
  valor_pago: number;
}

export interface ConvenioPagamentoInfo {
  temPagamento: boolean;
  quantidadeBaixas: number;
  ultimaData?: string | null;
  pagamentos: ConvenioPagamentoItem[];
}

export function getConvenioPagamentoInfo(
  fatura?: {
    data_pagamento?: string | null;
    valor_pago?: number | null;
    valor_total_fatura?: number;
    pagamentos?: FaturaFornecedorPagamento[];
  } | null
): ConvenioPagamentoInfo {
  if (!fatura) {
    return {
      temPagamento: false,
      quantidadeBaixas: 0,
      pagamentos: [],
    };
  }

  const pagamentosLista: ConvenioPagamentoItem[] =
    fatura.pagamentos && fatura.pagamentos.length > 0
      ? [...fatura.pagamentos]
          .sort((a, b) =>
            (b.data_pagamento || "").localeCompare(a.data_pagamento || "")
          )
          .map((p) => ({
            id: p.id,
            data_pagamento: p.data_pagamento,
            valor_pago: Number(p.valor_pago || 0),
          }))
      : fatura.data_pagamento
      ? [
          {
            id: "legacy",
            data_pagamento: fatura.data_pagamento,
            valor_pago: Number(fatura.valor_pago || fatura.valor_total_fatura || 0),
          },
        ]
      : [];

  if (pagamentosLista.length === 0) {
    return {
      temPagamento: false,
      quantidadeBaixas: 0,
      pagamentos: [],
    };
  }

  return {
    temPagamento: true,
    quantidadeBaixas: pagamentosLista.length,
    ultimaData: pagamentosLista[0].data_pagamento,
    pagamentos: pagamentosLista,
  };
}

import { ContaPagarItem, ContasPagarKpis } from "@/types/database";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";

function obterIntervaloSemanaAtual(): {
  hojeStr: string;
  mondayStr: string;
  sundayStr: string;
} {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0];

  const dTemp = new Date(hoje);
  const dayOfWeek = dTemp.getDay();
  const diffToMonday = dTemp.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(dTemp.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    hojeStr,
    mondayStr: monday.toISOString().split("T")[0],
    sundayStr: sunday.toISOString().split("T")[0],
  };
}

export function calcularKpisContasPagar(
  itensBase: ContaPagarItem[],
  hasBackendData: boolean
): ContasPagarKpis | undefined {
  if (!hasBackendData && itensBase.length === 0) return undefined;

  const { hojeStr, mondayStr, sundayStr } = obterIntervaloSemanaAtual();

  let totalAPagarMes = 0;
  let totalPagoMes = 0;
  let totalVencendoHoje = 0;
  let totalAtrasadas = 0;
  let totalSemana = 0;
  let qtdPendentes = 0;
  let qtdPagas = 0;

  for (const item of itensBase) {
    if (item.status === STATUS_DESPESA.CANCELADO) continue;

    if (item.status === STATUS_DESPESA.PAGO) {
      totalPagoMes += item.valor_pago || item.valor_previsto;
      qtdPagas++;
    } else {
      if (item.valor_pago > 0) {
        totalPagoMes += item.valor_pago;
      }
      totalAPagarMes += item.saldo_pendente;
      qtdPendentes++;

      if (item.data_vencimento === hojeStr) {
        totalVencendoHoje += item.saldo_pendente;
      } else if (item.data_vencimento < hojeStr) {
        totalAtrasadas += item.saldo_pendente;
      } else if (
        item.data_vencimento >= mondayStr &&
        item.data_vencimento <= sundayStr
      ) {
        totalSemana += item.saldo_pendente;
      }
    }
  }

  return {
    total_a_pagar_mes: parseFloat(totalAPagarMes.toFixed(2)),
    total_pago_mes: parseFloat(totalPagoMes.toFixed(2)),
    total_vencendo_hoje: parseFloat(totalVencendoHoje.toFixed(2)),
    total_atrasadas: parseFloat(totalAtrasadas.toFixed(2)),
    total_semana: parseFloat(totalSemana.toFixed(2)),
    quantidade_pendentes: qtdPendentes,
    quantidade_pagas: qtdPagas,
  };
}

export function filtrarContasPagarPorStatusEPrazo(
  itensBase: ContaPagarItem[],
  status: string,
  filtroPrazo: string | null
): ContaPagarItem[] {
  let list = itensBase;
  if (status !== "TODOS") {
    list = list.filter((i) => i.status === status);
  }
  if (filtroPrazo) {
    const { hojeStr, mondayStr, sundayStr } = obterIntervaloSemanaAtual();

    if (filtroPrazo === "HOJE") {
      list = list.filter(
        (i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento === hojeStr
      );
    } else if (filtroPrazo === "SEMANA") {
      list = list.filter(
        (i) =>
          i.status !== STATUS_DESPESA.PAGO &&
          i.data_vencimento > hojeStr &&
          i.data_vencimento >= mondayStr &&
          i.data_vencimento <= sundayStr
      );
    } else if (filtroPrazo === "ATRASADAS") {
      list = list.filter(
        (i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento < hojeStr
      );
    } else if (filtroPrazo === "PROXIMAS") {
      list = list.filter(
        (i) => i.status !== STATUS_DESPESA.PAGO && i.data_vencimento > sundayStr
      );
    }
  }
  return list;
}

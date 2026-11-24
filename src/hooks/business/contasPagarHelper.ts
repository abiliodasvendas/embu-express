import { ContaPagarItem, ContasPagarKpis } from "@/types/database";
import {
  FILTRO_CONTA_PAGAR,
  FiltroContaPagarType,
  STATUS_DESPESA,
} from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";

export interface ContadoresContasPagar {
  todos: number;
  vencendoHoje: number;
  atrasadas: number;
  estaSemana: number;
  proximas: number;
  pendentes: number;
  pagas: number;
  canceladas: number;
}

export function obterIntervaloSemanaAtual(): {
  hojeStr: string;
  mondayStr: string;
  sundayStr: string;
} {
  const hojeStr = toLocalDateString();
  const [ano, mes, dia] = hojeStr.split("-").map(Number);
  const baseLocal = new Date(ano, mes - 1, dia, 12, 0, 0);
  const dayOfWeek = baseLocal.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(baseLocal);
  monday.setDate(baseLocal.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    hojeStr,
    mondayStr: toLocalDateString(monday),
    sundayStr: toLocalDateString(sunday),
  };
}

function isItemEmAberto(item: ContaPagarItem): boolean {
  return (
    item.status !== STATUS_DESPESA.PAGO &&
    item.status !== STATUS_DESPESA.CANCELADO
  );
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

export function calcularContadoresContasPagar(
  itensBase: ContaPagarItem[]
): ContadoresContasPagar {
  const { hojeStr, mondayStr, sundayStr } = obterIntervaloSemanaAtual();

  const contadores: ContadoresContasPagar = {
    todos: itensBase.length,
    vencendoHoje: 0,
    atrasadas: 0,
    estaSemana: 0,
    proximas: 0,
    pendentes: 0,
    pagas: 0,
    canceladas: 0,
  };

  for (const item of itensBase) {
    if (item.status === STATUS_DESPESA.CANCELADO) {
      contadores.canceladas++;
      continue;
    }

    if (item.status === STATUS_DESPESA.PAGO) {
      contadores.pagas++;
      continue;
    }

    contadores.pendentes++;

    if (item.data_vencimento === hojeStr) {
      contadores.vencendoHoje++;
    } else if (item.data_vencimento < hojeStr) {
      contadores.atrasadas++;
    } else if (
      item.data_vencimento >= mondayStr &&
      item.data_vencimento <= sundayStr
    ) {
      contadores.estaSemana++;
    } else if (item.data_vencimento > sundayStr) {
      contadores.proximas++;
    }
  }

  return contadores;
}

export function filtrarContasPagar(
  itensBase: ContaPagarItem[],
  filtroAtivo: FiltroContaPagarType
): ContaPagarItem[] {
  if (filtroAtivo === FILTRO_CONTA_PAGAR.TODOS) {
    return itensBase;
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.PAGO) {
    return itensBase.filter((i) => i.status === STATUS_DESPESA.PAGO);
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.CANCELADO) {
    return itensBase.filter((i) => i.status === STATUS_DESPESA.CANCELADO);
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.PENDENTE) {
    return itensBase.filter(isItemEmAberto);
  }

  const { hojeStr, mondayStr, sundayStr } = obterIntervaloSemanaAtual();

  if (filtroAtivo === FILTRO_CONTA_PAGAR.VENCENDO_HOJE) {
    return itensBase.filter(
      (i) => isItemEmAberto(i) && i.data_vencimento === hojeStr
    );
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.ATRASADAS) {
    return itensBase.filter(
      (i) => isItemEmAberto(i) && i.data_vencimento < hojeStr
    );
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.ESTA_SEMANA) {
    return itensBase.filter(
      (i) =>
        isItemEmAberto(i) &&
        i.data_vencimento > hojeStr &&
        i.data_vencimento >= mondayStr &&
        i.data_vencimento <= sundayStr
    );
  }

  if (filtroAtivo === FILTRO_CONTA_PAGAR.PROXIMAS) {
    return itensBase.filter(
      (i) => isItemEmAberto(i) && i.data_vencimento > sundayStr
    );
  }

  return itensBase;
}

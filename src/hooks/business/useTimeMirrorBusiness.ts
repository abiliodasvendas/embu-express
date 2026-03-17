import { useMemo } from "react";
import { STATUS_CADASTRO } from "@/constants/cadastro";

export function useTimeMirrorBusiness() {
  const getShiftLabel = (r: any) => {
    return r.turno_hora_inicio && r.turno_hora_fim
      ? `${r.turno_hora_inicio.substring(0, 5)} - ${r.turno_hora_fim.substring(0, 5)}`
      : (r.detalhes_calculo?.entrada?.turno_base 
          ? `${r.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${(r.detalhes_calculo.saida?.turno_base || '00:00:00').substring(0, 5)}`
          : null);
  };

  const processRecords = (rawReport: any[], selectedShift: string) => {
    if (!rawReport || rawReport.length === 0) {
      return {
        records: [],
        totals: { worked: 0, expected: 0, balance: 0 },
        availableShifts: []
      };
    }
    
    // Filter by shift
    const filtered = selectedShift === STATUS_CADASTRO.TODOS 
      ? rawReport 
      : rawReport.filter(r => getShiftLabel(r) === selectedShift);

    // Calculate totals
    let workedMin = 0;
    let expectedMin = 0;

    filtered.forEach(day => {
      workedMin += (day.tempo_trabalhado_minutos || 0);
      expectedMin += ((day.tempo_trabalhado_minutos || 0) - (day.saldo_minutos || 0));
    });

    const totals = {
      worked: workedMin,
      expected: expectedMin,
      balance: workedMin - expectedMin
    };

    return {
      records: filtered,
      totals,
      availableShifts: Array.from(new Set(rawReport.map(getShiftLabel).filter(Boolean))) as string[]
    };
  };

  return {
    getShiftLabel,
    processRecords
  };
}

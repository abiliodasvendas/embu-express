import { useCallback } from "react";
import { FilterOptions } from "@/types/enums";
import { RegistroPonto, RelatorioPonto } from "@/types/database";

export function useTimeMirrorBusiness() {
  const getShiftLabel = useCallback((r: RegistroPonto) => {
    return r.detalhes_calculo?.entrada?.turno_base 
          ? `${r.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${(r.detalhes_calculo.saida?.turno_base || '00:00:00').substring(0, 5)}`
          : null;
  }, []);

  const processRecords = useCallback((rawReport: RelatorioPonto[], selectedShift: string) => {
    if (!rawReport || rawReport.length === 0) {
      return {
        records: [] as RelatorioPonto[],
        totals: { worked: 0, expected: 0, balance: 0 },
        availableShifts: [] as string[]
      };
    }
    
    const shifts = new Set<string>();
    rawReport.forEach(r => {
      const label = getShiftLabel(r);
      if (label) shifts.add(label);
    });

    const filtered = selectedShift === FilterOptions.TODOS 
      ? rawReport 
      : rawReport.filter(r => getShiftLabel(r) === selectedShift);

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
      availableShifts: Array.from(shifts).sort()
    };
  }, [getShiftLabel]);

  return {
    getShiftLabel,
    processRecords
  };
}

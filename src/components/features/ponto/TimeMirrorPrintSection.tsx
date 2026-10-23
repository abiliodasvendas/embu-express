import { PrintReportHeader } from "@/components/common/PrintReportHeader";
import { CALENDARIO_STATUS } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import type { EspelhoPontoMensal, PontoDiarioRelatorio } from "@/types/ponto-relatorio";
import { formatMinutes } from "@/utils/ponto";

interface TimeMirrorPrintSectionProps {
  activeReport: EspelhoPontoMensal;
  realizedDays: PontoDiarioRelatorio[];
  hourBalance: number;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  month: number;
  year: number;
}

export function TimeMirrorPrintSection({
  activeReport,
  realizedDays,
  hourBalance,
  colaboradorNome,
  cpf,
  cargo,
  month,
  year,
}: TimeMirrorPrintSectionProps) {
  const { kpis } = activeReport;

  return (
    <>
      <PrintReportHeader
        titulo="Relatório de Atividade"
        colaboradorNome={colaboradorNome}
        cpf={cpf}
        cargo={cargo}
        mes={month}
        ano={year}
      />

      <div className="hidden print:block space-y-4">
        <div className="grid grid-cols-4 gap-2 border border-border rounded-xl p-3 bg-muted/20">
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase block">
              {messages.ponto.labels.saldoAtual}
            </span>
            <span
              className={cn(
                "text-sm font-bold font-mono",
                hourBalance >= 0 ? "text-foreground" : "text-destructive"
              )}
            >
              {formatMinutes(hourBalance, true)}
            </span>
            <span className="text-[8px] text-muted-foreground block">
              {formatMinutes(kpis.horas_trabalhadas)} / {formatMinutes(kpis.horas_esperadas)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase block">
              Com Atividade
            </span>
            <span className="text-sm font-bold text-foreground">{kpis.dias_trabalhados} dias</span>
            <span className="text-[8px] text-muted-foreground block">
              Esperado: {kpis.dias_meta_turno} dias
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase block">
              {messages.ponto.labels.ausencias}
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                kpis.dias_ausencias === 0 ? "text-foreground" : "text-destructive"
              )}
            >
              {kpis.dias_ausencias}
            </span>
            <span className="text-[8px] text-muted-foreground block">
              {formatMinutes(kpis.horas_ausencias)} não realizadas
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase block">
              {messages.ponto.labels.rodagemKm}
            </span>
            <span className="text-sm font-bold text-foreground">{kpis.km_realizado} km</span>
            <span className="text-[8px] text-muted-foreground block">
              Saldo: {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km
            </span>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[8px] bg-muted/40">
                <th className="py-1.5 px-2">Dia</th>
                <th className="py-1.5 px-2">Cliente / Unidade</th>
                <th className="py-1.5 px-2">Status</th>
                <th className="py-1.5 px-2 text-center">Entrada</th>
                <th className="py-1.5 px-2 text-center">Saída</th>
                <th className="py-1.5 px-2 text-center">Efetivo</th>
                <th className="py-1.5 px-2 text-center">Esperado</th>
                <th className="py-1.5 px-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {realizedDays.map((day: PontoDiarioRelatorio, idx) => {
                const isLack = day.status === CALENDARIO_STATUS.SEM_ATIVIDADE;
                const isWorked = day.status === CALENDARIO_STATUS.TRABALHADO;
                const isFeriado = day.status === CALENDARIO_STATUS.FERIADO;
                const isNotVigente = day.status === CALENDARIO_STATUS.NAO_VIGENTE;
                return (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-1 px-2 font-bold whitespace-nowrap">
                      {day.dia_semana_curto} {String(day.dia).padStart(2, "0")}
                    </td>
                    <td className="py-1 px-2 text-foreground truncate max-w-[140px]">
                      {day.cliente_nome || "-"} {day.unidade_nome ? `(${day.unidade_nome})` : ""}
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded font-semibold text-[7px] uppercase tracking-wider bg-muted text-foreground border border-border">
                        {isWorked
                          ? messages.ponto.labels.ok
                          : isLack
                          ? messages.ponto.labels.ausencia.toUpperCase()
                          : isFeriado
                          ? "FERIADO"
                          : isNotVigente
                          ? messages.ponto.labels.off
                          : day.status}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-center whitespace-nowrap font-mono">
                      {day.entrada_hora ? day.entrada_hora.substring(11, 16) : "--:--"}
                    </td>
                    <td className="py-1 px-2 text-center whitespace-nowrap font-mono">
                      {day.saida_hora ? day.saida_hora.substring(11, 16) : "--:--"}
                    </td>
                    <td className="py-1 px-2 text-center font-bold font-mono whitespace-nowrap">
                      {formatMinutes(day.minutos_trabalhados)}
                    </td>
                    <td className="py-1 px-2 text-center text-muted-foreground font-mono whitespace-nowrap">
                      {formatMinutes(day.minutos_esperados)}
                    </td>
                    <td
                      className={cn(
                        "py-1 px-2 text-right font-bold font-mono whitespace-nowrap",
                        day.minutos_saldo > 0
                          ? "text-foreground"
                          : day.minutos_saldo < 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatMinutes(day.minutos_saldo, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

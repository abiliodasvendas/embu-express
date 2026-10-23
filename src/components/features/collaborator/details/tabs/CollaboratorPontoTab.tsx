import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { meses } from "@/utils/formatters/constants";
import { Clock, Printer } from "lucide-react";

interface CollaboratorPontoTabProps {
  colaboradorId: string;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  selectedMes: number;
  selectedAno: number;
  selectedShift?: string;
  availableShifts: { id: string | number; label: string }[];
  onSelectMes: (mes: number) => void;
  onSelectAno: (ano: number) => void;
  onSelectShift: (shiftId: string) => void;
}

export function CollaboratorPontoTab({
  colaboradorId,
  colaboradorNome,
  cpf,
  cargo,
  selectedMes,
  selectedAno,
  selectedShift,
  availableShifts,
  onSelectMes,
  onSelectAno,
  onSelectShift,
}: CollaboratorPontoTabProps) {
  const anosDisponiveis = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <Card className="border-0 shadow-sm rounded-[24px] min-h-[500px] print:shadow-none print:border-none print:p-0">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-6 pt-6 px-6 sm:px-8 gap-4 print:hidden">
        <div>
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-semibold">Espelho de Atividade</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Histórico detalhado de entradas e saídas.
              </span>
            </div>
          </CardTitle>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <NativeSelect
            value={String(selectedMes)}
            onChange={(e) => onSelectMes(Number(e.target.value))}
            className="w-[130px] h-10 rounded-[18px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
          >
            {meses.map((label, index) => (
              <option key={index} value={String(index + 1)}>
                {label}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={String(selectedAno)}
            onChange={(e) => onSelectAno(Number(e.target.value))}
            className="w-[94px] h-10 rounded-[18px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={String(ano)}>
                {ano}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={selectedShift || ""}
            onChange={(e) => onSelectShift(e.target.value)}
            disabled={availableShifts.length === 0}
            className="w-auto min-w-[180px] max-w-[260px] h-10 rounded-[18px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs truncate"
          >
            <option value="">
              {availableShifts.length === 0 ? "Sem turnos" : "Todos os turnos"}
            </option>
            {availableShifts.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.label}
              </option>
            ))}
          </NativeSelect>

          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-10 rounded-[18px] flex items-center gap-1.5 border-border text-foreground hover:bg-muted/50 font-medium text-xs px-3.5 shadow-xs select-none"
            title="Imprimir ou Salvar PDF"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span>Imprimir PDF</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-6 print:p-0">
        <TimeMirrorView
          usuarioId={colaboradorId}
          colaboradorNome={colaboradorNome}
          cpf={cpf}
          cargo={cargo}
          selectedMonth={selectedMes}
          selectedYear={selectedAno}
          selectedShift={selectedShift}
          isActionable
        />
      </CardContent>
    </Card>
  );
}

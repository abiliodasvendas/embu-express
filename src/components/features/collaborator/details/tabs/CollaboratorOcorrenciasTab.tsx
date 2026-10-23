import { OccurrenceView } from "@/components/features/ocorrencias/OccurrenceView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { meses } from "@/utils/formatters/constants";
import { History, Plus } from "lucide-react";

interface CollaboratorOcorrenciasTabProps {
  colaboradorId: string;
  selectedMes: number;
  selectedAno: number;
  onSelectMes: (mes: number) => void;
  onSelectAno: (ano: number) => void;
  onRegisterOccurrence: () => void;
  onOccurrenceDeleted: () => void;
}

export function CollaboratorOcorrenciasTab({
  colaboradorId,
  selectedMes,
  selectedAno,
  onSelectMes,
  onSelectAno,
  onRegisterOccurrence,
  onOccurrenceDeleted,
}: CollaboratorOcorrenciasTabProps) {
  const anosDisponiveis = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <Card className="border-0 shadow-sm rounded-[24px] min-h-[500px]">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-6 pt-6 px-6 sm:px-8 gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-semibold">Histórico de Ocorrências</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Registros de ausências, atrasos e outros eventos.
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

          <Button
            onClick={onRegisterOccurrence}
            className="h-10 rounded-[18px] px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Registrar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-6">
        <OccurrenceView
          usuarioId={colaboradorId}
          mode="monthly"
          selectedMonth={selectedMes}
          selectedYear={selectedAno}
          showFilters={false}
          impactoFinanceiro={false}
          onOccurrenceDeleted={onOccurrenceDeleted}
        />
      </CardContent>
    </Card>
  );
}

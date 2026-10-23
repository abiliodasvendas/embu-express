import { Users } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { FinancialReportView } from "../FinancialReportView";

interface CollaboratorOption {
  id?: unknown;
  nome_completo?: unknown;
}

interface FechamentoIndividualTabProps {
  collaborators: CollaboratorOption[];
  selectedUsuario: string;
  onSelectUsuario: (id: string) => void;
  usuarioId?: string;
  colaboradorNome?: string;
  selectedMonth: number;
  selectedYear: number;
}

export function FechamentoIndividualTab({
  collaborators,
  selectedUsuario,
  onSelectUsuario,
  usuarioId,
  colaboradorNome,
  selectedMonth,
  selectedYear,
}: FechamentoIndividualTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] sm:rounded-[24px] border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Colaborador Selecionado
            </p>
            <p className="text-xs text-muted-foreground">
              Selecione para detalhar o fechamento
            </p>
          </div>
        </div>
        <div className="w-full sm:w-[280px]">
          <Combobox
            options={[
              { value: "todos", label: "Selecionar Colaborador" },
              ...collaborators.map((c) => ({
                value: String(c.id),
                label: String(c.nome_completo),
              })),
            ]}
            value={selectedUsuario || "todos"}
            onSelect={(val) => onSelectUsuario(val === "todos" ? "todos" : val)}
            placeholder="Selecionar Colaborador"
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
          />
        </div>
      </div>

      <FinancialReportView
        usuarioId={usuarioId}
        colaboradorNome={colaboradorNome}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Building2, Plus } from "lucide-react";
import { Empresa } from "@/types/database";

interface DreHeaderProps {
  empresaNome: string;
  modoVisao: "realizado" | "projetado";
  onModoVisaoChange: (modo: "realizado" | "projetado") => void;
  selectedEmpresaId: string;
  onEmpresaChange: (empresaId: string) => void;
  empresas: Empresa[];
  onNovaDespesa: () => void;
}

export function DreHeader({
  empresaNome,
  modoVisao,
  onModoVisaoChange,
  selectedEmpresaId,
  onEmpresaChange,
  empresas,
  onNovaDespesa,
}: DreHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
            Visão Societária
          </p>
          <p className="text-sm font-bold text-foreground leading-none">
            {empresaNome}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center p-1 bg-muted/60 rounded-[14px] border border-border shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-[10px] text-xs font-semibold transition-all ${
              modoVisao === "realizado"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onModoVisaoChange("realizado")}
          >
            Realizado (Efetivo)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 rounded-[10px] text-xs font-semibold transition-all ${
              modoVisao === "projetado"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onModoVisaoChange("projetado")}
          >
            Projetado (Previsto)
          </Button>
        </div>

        <div className="w-full sm:w-56">
          <NativeSelect
            value={selectedEmpresaId}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="h-10 rounded-[14px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
          >
            <option value="todas">Consolidado (Holding - 4 CNPJs)</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.nome_fantasia} {emp.codigo ? `(${emp.codigo})` : ""}
              </option>
            ))}
          </NativeSelect>
        </div>

        <Button
          onClick={onNovaDespesa}
          className="h-10 px-3.5 gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[14px] shadow-xs text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Lançar Despesa</span>
        </Button>
      </div>
    </div>
  );
}

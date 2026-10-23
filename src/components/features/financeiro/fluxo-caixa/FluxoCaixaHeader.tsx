import { Building2 } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import type { Empresa } from "@/types/database";

interface FluxoCaixaHeaderProps {
  selectedEmpresaId: string;
  setSelectedEmpresaId: (id: string) => void;
  selectedEmpresa: Empresa | undefined;
  empresas: Empresa[];
}

export function FluxoCaixaHeader({
  selectedEmpresaId,
  setSelectedEmpresaId,
  selectedEmpresa,
  empresas,
}: FluxoCaixaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
            Visão Societária
          </p>
          <p className="text-sm font-bold text-foreground leading-none">
            {selectedEmpresa
              ? selectedEmpresa.nome_fantasia || selectedEmpresa.razao_social
              : "Consolidado (Holding - 4 CNPJs)"}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-64">
        <NativeSelect
          value={selectedEmpresaId}
          onChange={(e) => setSelectedEmpresaId(e.target.value)}
          className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
        >
          <option value="todas">Consolidado (Holding - 4 CNPJs)</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={String(emp.id)}>
              {emp.nome_fantasia} {emp.codigo ? `(${emp.codigo})` : ""}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { Empresa } from "@/types/database";
import { meses } from "@/utils/formatters/constants";
import { Plus, RotateCcw } from "lucide-react";

interface ContasPagarToolbarProps {
  busca: string;
  onBuscaChange: (busca: string) => void;
  mes: number;
  onMesChange: (mes: number) => void;
  ano: number;
  onAnoChange: (ano: number) => void;
  empresaId: number | null;
  onEmpresaChange: (id: number | null) => void;
  tipoFiltro: "TODOS" | "DESPESA" | "CONVENIO";
  onTipoChange: (tipo: "TODOS" | "DESPESA" | "CONVENIO") => void;
  status: string;
  onStatusChange: (status: string) => void;
  empresas: Empresa[];
  onNovaDespesa: () => void;
  canEdit?: boolean;
  onRefresh: () => void;
  isFetching?: boolean;
}

export function ContasPagarToolbar({
  busca,
  onBuscaChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  empresaId,
  onEmpresaChange,
  tipoFiltro,
  onTipoChange,
  status,
  onStatusChange,
  empresas,
  onNovaDespesa,
  canEdit = true,
  onRefresh,
  isFetching = false,
}: ContasPagarToolbarProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        <TableSearchInput
          value={busca}
          onChange={onBuscaChange}
          placeholder="Buscar por descrição, fornecedor ou categoria..."
          className="w-full sm:w-64"
        />

        <NativeSelect
          value={String(mes)}
          onChange={(e) => onMesChange(Number(e.target.value))}
          className="h-10 w-[130px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          {meses.map((m, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(ano)}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="h-10 w-[90px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
            <option key={a} value={String(a)}>
              {a}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={empresaId ? String(empresaId) : "todas"}
          onChange={(e) => onEmpresaChange(e.target.value === "todas" ? null : Number(e.target.value))}
          className="h-10 w-[180px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todas">Todas as Empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={String(emp.id)}>
              {emp.nome_fantasia || emp.razao_social}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={tipoFiltro}
          onChange={(e) => onTipoChange(e.target.value as "TODOS" | "DESPESA" | "CONVENIO")}
          className="h-10 w-[140px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="TODOS">Todos os Tipos</option>
          <option value="DESPESA">Apenas Despesas</option>
          <option value="CONVENIO">Apenas Convênios</option>
        </NativeSelect>

        <NativeSelect
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 w-[140px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="TODOS">Todos os Status</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="PAGO">Pagas</option>
          <option value="ADIADA">Adiada</option>
          <option value="CANCELADO">Cancelada</option>
        </NativeSelect>
      </div>

      {canEdit && (
        <Button
          onClick={onNovaDespesa}
          className="h-10 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 gap-2 shadow-xs text-xs cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Despesa</span>
        </Button>
      )}
    </div>
  );
}

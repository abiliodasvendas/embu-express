import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import {
  STATUS_DESPESA,
  CATEGORIA_DESPESA_LABELS,
} from "@/constants/financeiro.constants";
import { meses } from "@/utils/formatters/constants";
import { Plus } from "lucide-react";

interface EmpresaOption {
  id: number;
  nome_fantasia?: string | null;
  razao_social?: string | null;
}

interface DespesasToolbarProps {
  searchDespesa: string;
  onSearchChange: (value: string) => void;
  mes: number;
  onMesChange: (value: number) => void;
  ano: number;
  onAnoChange: (value: number) => void;
  empresaDespesaFiltro: string;
  onEmpresaChange: (value: string) => void;
  categoriaDespesaFiltro: string;
  onCategoriaChange: (value: string) => void;
  statusDespesaFiltro: string;
  onStatusChange: (value: string) => void;
  empresasList: EmpresaOption[];
  onNovaDespesa: () => void;
}

export function DespesasToolbar({
  searchDespesa,
  onSearchChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  empresaDespesaFiltro,
  onEmpresaChange,
  categoriaDespesaFiltro,
  onCategoriaChange,
  statusDespesaFiltro,
  onStatusChange,
  empresasList,
  onNovaDespesa,
}: DespesasToolbarProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        <TableSearchInput
          value={searchDespesa}
          onChange={onSearchChange}
          placeholder="Buscar despesa por descrição..."
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
          value={empresaDespesaFiltro}
          onChange={(e) => onEmpresaChange(e.target.value)}
          className="h-10 w-[180px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todas">Todas as Empresas</option>
          <option value="holding">Geral Holding (Rateio)</option>
          {empresasList.map((emp) => (
            <option key={emp.id} value={String(emp.id)}>
              {emp.nome_fantasia || emp.razao_social}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={categoriaDespesaFiltro}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="h-10 w-[180px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todas">Todas as Categorias</option>
          {Object.entries(CATEGORIA_DESPESA_LABELS).map(([catKey, catLabel]) => (
            <option key={catKey} value={catKey}>
              {catLabel}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={statusDespesaFiltro}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 w-[160px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todos">Todos os Status</option>
          <option value={STATUS_DESPESA.PENDENTE}>A Pagar (Pendente)</option>
          <option value={STATUS_DESPESA.PAGO}>Pago / Liquidado</option>
          <option value={STATUS_DESPESA.ADIADA}>Adiada</option>
          <option value={STATUS_DESPESA.CANCELADO}>Cancelada</option>
        </NativeSelect>
      </div>

      <Button
        size="sm"
        onClick={onNovaDespesa}
        className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 text-xs shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span>Nova Despesa</span>
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { STATUS_FATURA } from "@/constants/financeiro.constants";
import { meses } from "@/utils/formatters/constants";
import { Plus, Clock } from "lucide-react";

interface EmpresaOption {
  id: number;
  nome_fantasia?: string | null;
  razao_social?: string | null;
}

interface FaturasToolbarProps {
  searchFatura: string;
  onSearchChange: (value: string) => void;
  mes: number;
  onMesChange: (value: number) => void;
  ano: number;
  onAnoChange: (value: number) => void;
  empresaFaturaFiltro: string;
  onEmpresaChange: (value: string) => void;
  periodoFiltro: string;
  onPeriodoChange: (value: string) => void;
  statusFiltro: string;
  onStatusChange: (value: string) => void;
  empresasList: EmpresaOption[];
  onNovaFatura: () => void;
  canEdit?: boolean;
  agingFaixaFiltro: string | null;
  agingFaixaDescricao?: string;
  totalExibidas: number;
  onClearAgingFaixa: () => void;
}

export function FaturasToolbar({
  searchFatura,
  onSearchChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  empresaFaturaFiltro,
  onEmpresaChange,
  periodoFiltro,
  onPeriodoChange,
  statusFiltro,
  onStatusChange,
  empresasList,
  onNovaFatura,
  canEdit = true,
  agingFaixaFiltro,
  agingFaixaDescricao,
  totalExibidas,
  onClearAgingFaixa,
}: FaturasToolbarProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <TableSearchInput
            value={searchFatura}
            onChange={onSearchChange}
            placeholder="Buscar por cliente, empresa ou OS..."
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
            value={empresaFaturaFiltro}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="h-10 w-[180px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
          >
            <option value="todas">Todas as Empresas</option>
            {empresasList.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.nome_fantasia || emp.razao_social}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={periodoFiltro}
            onChange={(e) => onPeriodoChange(e.target.value)}
            className="h-10 w-[150px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
          >
            <option value="todas">Todos os Períodos</option>
            <option value="1">1ª Quinzena (01-15)</option>
            <option value="2">2ª Quinzena (16-fim)</option>
            <option value="MENSAL">Mensal (Integral)</option>
          </NativeSelect>

          <NativeSelect
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 w-[150px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value={STATUS_FATURA.PENDENTE}>Pendente / Em Aberto</option>
            <option value={STATUS_FATURA.PAGO_PARCIAL}>Pago Parcial</option>
            <option value={STATUS_FATURA.LIQUIDADA}>Quitado / Recebido</option>
            <option value={STATUS_FATURA.CANCELADA}>Cancelada</option>
          </NativeSelect>
        </div>

        {canEdit && (
          <Button
            size="sm"
            onClick={onNovaFatura}
            className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 text-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Fatura</span>
          </Button>
        )}
      </div>

      {agingFaixaFiltro && (
        <div className="flex items-center justify-between bg-muted/40 border border-border px-3.5 py-2 rounded-[14px] text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground shrink-0" />
            <span>
              Filtro ativo: <strong>{agingFaixaDescricao}</strong> ({totalExibidas} fatura(s))
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAgingFaixa}
            className="h-7 px-2.5 text-xs font-medium hover:bg-muted"
          >
            Limpar Filtro
          </Button>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { ESCOPO_CATEGORIA_FINANCEIRA } from "@/constants/financeiro.constants";
import { useLayout } from "@/contexts/LayoutContext";
import { meses } from "@/utils/formatters/constants";
import { Plus, Tags } from "lucide-react";

interface AvulsasToolbarProps {
  searchMovimentacao: string;
  onSearchChange: (value: string) => void;
  mes: number;
  onMesChange: (value: number) => void;
  ano: number;
  onAnoChange: (value: number) => void;
  tipoMovimentacaoFiltro: string;
  onTipoMovimentacaoChange: (value: string) => void;
  onNovoLancamento: () => void;
  canEdit?: boolean;
  modo?: "ENTRADA" | "SAIDA" | "TODOS";
}

export function AvulsasToolbar({
  searchMovimentacao,
  onSearchChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  tipoMovimentacaoFiltro,
  onTipoMovimentacaoChange,
  onNovoLancamento,
  canEdit = true,
  modo = "TODOS",
}: AvulsasToolbarProps) {
  const { openCategoriasFinanceirasDialog } = useLayout();
  const anoAtual = new Date().getFullYear();

  const handleOpenCategorias = () => {
    openCategoriasFinanceirasDialog({
      escopoInicial:
        modo === "ENTRADA"
          ? ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA
          : ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        <TableSearchInput
          value={searchMovimentacao}
          onChange={onSearchChange}
          placeholder="Buscar por descrição, empresa ou banco..."
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

        {modo === "TODOS" && (
          <NativeSelect
            value={tipoMovimentacaoFiltro}
            onChange={(e) => onTipoMovimentacaoChange(e.target.value)}
            className="h-10 w-48 rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
          >
            <option value="todos">Todas as Operações</option>
            <option value="ENTRADA">Apenas Entradas</option>
            <option value="SAIDA">Apenas Saídas</option>
          </NativeSelect>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenCategorias}
            className="h-10 rounded-[14px] bg-card hover:bg-surface-alt border-border text-foreground font-semibold px-3.5 gap-1.5 shadow-xs transition-all active:scale-95 text-xs shrink-0 cursor-pointer select-none"
          >
            <Tags className="h-3.5 w-3.5 text-primary" />
            <span>Categorias</span>
          </Button>
          <Button
            size="sm"
            onClick={onNovoLancamento}
            className="h-10 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 text-xs shrink-0 cursor-pointer select-none"
          >
            <Plus className="h-4 w-4" />
            <span>
              {modo === "ENTRADA"
                ? "Nova Entrada"
                : modo === "SAIDA"
                ? "Nova Saída"
                : "Novo Lançamento"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

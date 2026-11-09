import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  StatusAdiantamentoFilter,
  StatusFechamentoFilter,
  StatusCadastroFilter,
} from "@/hooks/ui/financeiro";

interface FechamentoGeralToolbarProps {
  adiantamentoFilter: StatusAdiantamentoFilter;
  onAdiantamentoFilterChange: (value: StatusAdiantamentoFilter) => void;
  fechamentoFilter: StatusFechamentoFilter;
  onFechamentoFilterChange: (value: StatusFechamentoFilter) => void;
  statusCadastroFilter: StatusCadastroFilter;
  onStatusCadastroFilterChange: (value: StatusCadastroFilter) => void;
}

export function FechamentoGeralToolbar({
  adiantamentoFilter,
  onAdiantamentoFilterChange,
  fechamentoFilter,
  onFechamentoFilterChange,
  statusCadastroFilter,
  onStatusCadastroFilterChange,
}: FechamentoGeralToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[145px] space-y-1">
        <Label className="text-xs font-medium text-muted-foreground ml-1">
          Status Colaborador
        </Label>
        <NativeSelect
          value={statusCadastroFilter}
          onChange={(e) =>
            onStatusCadastroFilterChange(e.target.value as StatusCadastroFilter)
          }
          className="h-10 rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </NativeSelect>
      </div>

      <div className="w-[145px] space-y-1">
        <Label className="text-xs font-medium text-muted-foreground ml-1">
          Adiantamento
        </Label>
        <NativeSelect
          value={adiantamentoFilter}
          onChange={(e) =>
            onAdiantamentoFilterChange(e.target.value as StatusAdiantamentoFilter)
          }
          className="h-10 rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
        </NativeSelect>
      </div>

      <div className="w-[145px] space-y-1">
        <Label className="text-xs font-medium text-muted-foreground ml-1">
          Fechamento
        </Label>
        <NativeSelect
          value={fechamentoFilter}
          onChange={(e) =>
            onFechamentoFilterChange(e.target.value as StatusFechamentoFilter)
          }
          className="h-10 rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Pago</option>
        </NativeSelect>
      </div>
    </div>
  );
}

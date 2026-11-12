import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { FILTRO_EXTRATO_TIPO } from "@/constants/financeiro.constants";
import { TipoFiltroExtrato } from "@/hooks/ui/contas-bancarias/useExtratoContaBancariaViewModel";
import { meses } from "@/utils/formatters/constants";
import { ArrowLeftRight, Plus } from "lucide-react";

interface ExtratoToolbarProps {
  busca: string;
  onBuscaChange: (val: string) => void;
  tipoFiltro: TipoFiltroExtrato;
  onTipoFiltroChange: (val: TipoFiltroExtrato) => void;
  mes: number;
  onMesChange: (val: number) => void;
  ano: number;
  onAnoChange: (val: number) => void;
  anosDisponiveis: number[];
  onNovaTransferencia: () => void;
  onNovoLancamento: () => void;
}

export function ExtratoToolbar({
  busca,
  onBuscaChange,
  tipoFiltro,
  onTipoFiltroChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  anosDisponiveis,
  onNovaTransferencia,
  onNovoLancamento,
}: ExtratoToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-muted/30 p-3.5 rounded-[24px] border border-border">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        <TableSearchInput
          value={busca}
          onChange={onBuscaChange}
          placeholder="Buscar no histórico do extrato..."
          className="w-full sm:w-52 lg:w-60"
        />

        <NativeSelect
          value={tipoFiltro}
          onChange={(e) =>
            onTipoFiltroChange(e.target.value as TipoFiltroExtrato)
          }
          className="h-10 w-[148px] rounded-[18px] bg-card border-border text-xs font-medium"
        >
          <option value={FILTRO_EXTRATO_TIPO.TODOS}>Todas Movimentações</option>
          <option value={FILTRO_EXTRATO_TIPO.ENTRADA}>Apenas Entradas (+)</option>
          <option value={FILTRO_EXTRATO_TIPO.SAIDA}>Apenas Saídas (-)</option>
        </NativeSelect>

        <NativeSelect
          value={String(mes)}
          onChange={(e) => onMesChange(Number(e.target.value))}
          className="h-10 w-[120px] rounded-[18px] bg-card border-border text-xs font-semibold"
        >
          {meses.map((nomeMes, idx) => (
            <option key={idx + 1} value={String(idx + 1)}>
              {nomeMes}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(ano)}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="h-10 w-[84px] rounded-[18px] bg-card border-border text-xs font-semibold"
        >
          {anosDisponiveis.map((a) => (
            <option key={a} value={String(a)}>
              {a}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNovaTransferencia}
          className="h-10 rounded-[18px] px-3.5 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-surface-alt cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
          <span>Transferir</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onNovoLancamento}
          className="h-10 rounded-[18px] px-4 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </Button>
      </div>
    </div>
  );
}

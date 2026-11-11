import { BaseDialog } from "@/components/ui/BaseDialog";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import {
  useExtratoContaBancariaViewModel,
  TipoFiltroExtrato,
} from "@/hooks/ui/contas-bancarias/useExtratoContaBancariaViewModel";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { meses } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  ReceiptText,
  Wallet,
} from "lucide-react";

export interface ExtratoContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaId: string;
  bancoNome?: string;
  agencia?: string | null;
  contaNumero?: string | null;
  empresaNome?: string;
  mesInicial?: number;
  anoInicial?: number;
}

export function ExtratoContaBancariaDialog({
  open,
  onOpenChange,
  contaId,
  bancoNome,
  agencia,
  contaNumero,
  empresaNome,
  mesInicial,
  anoInicial,
}: ExtratoContaBancariaDialogProps) {
  const {
    mes,
    setMes,
    ano,
    setAno,
    tipoFiltro,
    setTipoFiltro,
    busca,
    setBusca,
    nomeBanco,
    agInfo,
    ccInfo,
    empInfo,
    resumo,
    itensFiltrados,
    anosDisponiveis,
    isLoading,
  } = useExtratoContaBancariaViewModel({
    open,
    contaId,
    bancoNome,
    agencia,
    contaNumero,
    empresaNome,
    mesInicial,
    anoInicial,
  });

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog open={open} onOpenChange={handleClose} maxWidth="5xl">
      <BaseDialog.Header
        icon={<ReceiptText className="w-5 h-5 text-foreground" />}
        title={`Extrato Bancário — ${nomeBanco}`}
        subtitle={`Ag: ${agInfo} • Conta: ${ccInfo} • ${empInfo}`}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-[18px] border border-border">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
            <TableSearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar no histórico do extrato..."
              className="w-full sm:w-64"
            />

            <NativeSelect
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoFiltroExtrato)}
              className="h-10 w-[155px] rounded-[18px] bg-card border-border text-xs font-medium"
            >
              <option value="TODOS">Todas Movimentações</option>
              <option value="ENTRADA">Apenas Entradas (+)</option>
              <option value="SAIDA">Apenas Saídas (-)</option>
            </NativeSelect>
          </div>

          <div className="flex items-center gap-2">
            <NativeSelect
              value={String(mes)}
              onChange={(e) => setMes(Number(e.target.value))}
              className="h-10 w-[135px] rounded-[18px] bg-card border-border text-xs font-semibold"
            >
              {meses.map((nomeMes, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {nomeMes}
                </option>
              ))}
            </NativeSelect>

            <NativeSelect
              value={String(ano)}
              onChange={(e) => setAno(Number(e.target.value))}
              className="h-10 w-[95px] rounded-[18px] bg-card border-border text-xs font-semibold"
            >
              {anosDisponiveis.map((a) => (
                <option key={a} value={String(a)}>
                  {a}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[18px] border border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Saldo Anterior</span>
              <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span
              className={cn(
                "text-sm sm:text-base font-bold tabular-nums block",
                resumo.saldo_anterior < 0 ? "text-rose-600" : "text-foreground"
              )}
            >
              {formatCurrency(resumo.saldo_anterior)}
            </span>
          </div>

          <div className="p-3.5 rounded-[18px] border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="font-medium">Entradas no Mês (+)</span>
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm sm:text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 block">
              + {formatCurrency(resumo.total_entradas)}
            </span>
          </div>

          <div className="p-3.5 rounded-[18px] border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 mb-1">
              <span className="font-medium">Saídas no Mês (-)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm sm:text-base font-bold tabular-nums text-rose-600 dark:text-rose-400 block">
              - {formatCurrency(resumo.total_saidas)}
            </span>
          </div>

          <div className="p-3.5 rounded-[18px] border border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium">Saldo Final do Período</span>
              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span
              className={cn(
                "text-sm sm:text-base font-bold tabular-nums block",
                resumo.saldo_final < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
              )}
            >
              {formatCurrency(resumo.saldo_final)}
            </span>
          </div>
        </div>

        <div className="rounded-[24px] border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4 w-[105px]">Data</th>
                  <th className="py-3 px-4">Histórico / Lançamento</th>
                  <th className="py-3 px-4 w-[155px]">Categoria</th>
                  <th className="py-3 px-4 w-[135px] text-right text-emerald-700 dark:text-emerald-400">
                    Entradas (+)
                  </th>
                  <th className="py-3 px-4 w-[135px] text-right text-rose-700 dark:text-rose-400">
                    Saídas (-)
                  </th>
                  <th className="py-3 px-4 w-[140px] text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="bg-muted/20 font-medium">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    01/{String(mes).padStart(2, "0")}/{ano}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground" colSpan={2}>
                    SALDO ANTERIOR
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                  <td
                    className={cn(
                      "py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap",
                      resumo.saldo_anterior < 0 ? "text-rose-600" : "text-foreground"
                    )}
                  >
                    {formatCurrency(resumo.saldo_anterior)}
                  </td>
                </tr>

                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      Carregando movimentações do extrato...
                    </td>
                  </tr>
                ) : itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhuma movimentação realizada encontrada neste período.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item) => {
                    const isEntrada = item.tipo === "ENTRADA";
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                          {formatDateToBR(item.data)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground block">
                            {item.descricao}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="rounded-[18px] text-[10px] font-medium bg-muted/40 border-border text-muted-foreground"
                          >
                            {item.origem_label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap tabular-nums">
                          {isEntrada ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              + {formatCurrency(item.valor)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap tabular-nums">
                          {!isEntrada ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              - {formatCurrency(item.valor)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td
                          className={cn(
                            "py-3 px-4 text-right whitespace-nowrap font-semibold tabular-nums",
                            item.saldo_apos < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          )}
                        >
                          {formatCurrency(item.saldo_apos)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar Extrato"
          variant="secondary"
          onClick={handleClose}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ExtratoContaBancariaDialog;

import { useLiquidacaoLotePagamentoVM } from "@/hooks/ui/contas-pagar/useLiquidacaoLotePagamentoVM";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatContaBancaria } from "@/utils/formatters/contaBancaria";
import { formatDateToBR } from "@/utils/formatters/date";
import {
  Wallet,
  Building2,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCheck,
  Search,
  Loader2,
} from "lucide-react";

interface LiquidacaoLotePagamentoTabProps {
  onVoltar?: () => void;
}

export function LiquidacaoLotePagamentoTab({ onVoltar }: LiquidacaoLotePagamentoTabProps) {
  const vm = useLiquidacaoLotePagamentoVM();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-[24px] border-border shadow-xs bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Origem do Pagamento</CardTitle>
                <CardDescription className="text-xs">
                  Conta bancária de onde saíram os recursos para quitação
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="h-5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Conta Bancária Pagadora (Origem)</span>
                <span className="text-destructive">*</span>
              </label>
              <NativeSelect
                value={vm.contaBancariaId}
                onChange={(e) => vm.setContaBancariaId(e.target.value)}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium"
              >
                <option value="">Selecione a conta pagadora...</option>
                {vm.contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatContaBancaria(c)}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <label className="h-5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Data do Pagamento</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={vm.dataPagamento}
                onChange={(e) => vm.setDataPagamento(e.target.value)}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Observação do Lote
              </label>
              <Textarea
                placeholder="Ex: Pagamentos em lote de fornecedores e contas..."
                value={vm.observacao}
                onChange={(e) => vm.setObservacao(e.target.value)}
                rows={2}
                className="rounded-[18px] bg-background border-border text-xs sm:text-sm"
              />
            </div>

            <div className="p-4 rounded-[18px] bg-muted/40 border border-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Itens Selecionados:</span>
                <span className="font-semibold text-foreground">{vm.selectedIds.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total Previsto:</span>
                <span className="font-semibold text-foreground">{formatCurrency(vm.totalSelecionado)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground">Total do Lote:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(vm.totalAlocado)}
                </span>
              </div>
            </div>

            <Button
              onClick={vm.handleConfirmarLote}
              disabled={vm.isSubmitting || vm.selectedIds.length === 0 || !vm.contaBancariaId}
              className="w-full h-11 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-xs cursor-pointer select-none"
            >
              {vm.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando Liquidação...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="h-4 w-4" />
                  <span>Confirmar Pagamento em Lote</span>
                </>
              )}
            </Button>

            {onVoltar && (
              <Button
                variant="ghost"
                onClick={onVoltar}
                className="w-full h-10 rounded-[18px] text-muted-foreground hover:text-foreground text-xs gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para Listagem</span>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[24px] border-border shadow-xs bg-card flex flex-col min-h-[450px]">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Contas Pendentes de Liquidação</CardTitle>
                <CardDescription className="text-xs">
                  Selecione as despesas e faturas de convênio que deseja quitar neste lote
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={vm.toggleSelectAll}
                  className="h-8 rounded-[12px] text-xs font-medium border-border"
                >
                  {vm.selectedIds.length === vm.itens.length && vm.itens.length > 0
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Filtrar por descrição..."
                  value={vm.busca}
                  onChange={(e) => vm.setBusca(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-[14px] bg-background border-border"
                />
              </div>

              <NativeSelect
                value={vm.tipoFiltro}
                onChange={(e) => vm.setTipoFiltro(e.target.value as "TODOS" | "DESPESA" | "CONVENIO")}
                className="h-9 text-xs rounded-[14px] bg-background border-border min-w-[130px]"
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="DESPESA">Apenas Despesas</option>
                <option value="CONVENIO">Apenas Convênios</option>
              </NativeSelect>

              <NativeSelect
                value={vm.empresaId || ""}
                onChange={(e) => vm.setEmpresaId(e.target.value ? Number(e.target.value) : null)}
                className="h-9 text-xs rounded-[14px] bg-background border-border min-w-[130px]"
              >
                <option value="">Todas empresas</option>
                {vm.empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.razao_social}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-auto">
            {vm.isLoading ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                Carregando compromissos em aberto...
              </div>
            ) : vm.itens.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Nenhuma conta pendente encontrada</p>
                <p>Todos os compromissos para o período selecionado já foram quitados.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20">
                    <TableHead className="w-[45px] text-center"></TableHead>
                    <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider">Tipo</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Descrição</TableHead>
                    <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider">Vencimento</TableHead>
                    <TableHead className="w-[110px] text-right text-xs font-semibold uppercase tracking-wider">Saldo Devido</TableHead>
                    <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wider">Valor Pago (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.itens.map((item) => {
                    const isSelected = vm.selectedIds.includes(item.id);
                    const valorAlocado = vm.alocacoes[item.id] !== undefined ? vm.alocacoes[item.id] : item.saldo_pendente;

                    return (
                      <TableRow
                        key={`${item.tipo}_${item.id}`}
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-muted/20" : ""}`}
                      >
                        <TableCell className="text-center py-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => vm.toggleSelect(item)}
                            className="rounded-[6px]"
                          />
                        </TableCell>

                        <TableCell className="py-2">
                          <Badge variant="secondary" className="rounded-[10px] text-[10px] font-semibold">
                            {item.tipo === "CONVENIO" ? "CONVÊNIO" : "DESPESA"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground line-clamp-1">{item.descricao}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {item.empresa_nome ? `${item.empresa_nome} • ` : ""}{item.categoria}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs py-2">
                          {formatDateToBR(item.data_vencimento)}
                        </TableCell>

                        <TableCell className="text-right text-xs font-semibold py-2">
                          {formatCurrency(item.saldo_pendente)}
                        </TableCell>

                        <TableCell className="text-right py-2">
                          {isSelected ? (
                            <MoneyInput
                              value={valorAlocado}
                              onChange={(val) => vm.handleAlocacaoChange(item.id, Number(val) || 0)}
                              className="h-8 text-right text-xs font-semibold rounded-[10px] max-w-[130px] ml-auto"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

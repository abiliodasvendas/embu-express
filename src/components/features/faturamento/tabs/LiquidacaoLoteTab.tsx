import { useLiquidacaoLoteViewModel } from "@/hooks/ui/faturamento";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { meses } from "@/utils/formatters/constants";
import { formatCurrency, formatContaBancaria } from "@/utils/formatters";
import { formatDateToBR } from "@/utils/formatters/date";
import { TIPO_PERIODO_FATURA, FILTRO_PERIODO_FATURA } from "@/constants/financeiro.constants";
import { getFaturaPeriodoTexto } from "../faturas/faturaTableUtils";
import {
  Layers,
  Building2,
  Calendar,
  Wallet,
  Sparkles,
  ArrowLeft,
  CheckCheck,
  XCircle,
} from "lucide-react";

interface LiquidacaoLoteTabProps {
  mes: number;
  ano: number;
  onVoltar?: () => void;
}

export function LiquidacaoLoteTab({ mes: mesInicial, ano: anoInicial, onVoltar }: LiquidacaoLoteTabProps) {
  const vm = useLiquidacaoLoteViewModel({
    initialMes: mesInicial,
    initialAno: anoInicial,
  });

  const anoAtual = new Date().getFullYear();

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
                <CardTitle className="text-base sm:text-lg font-bold">Destino do Pagamento</CardTitle>
                <CardDescription className="text-xs">
                  Conta bancária onde os valores dos clientes caíram
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="h-5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Conta Bancária de Destino</span>
                <span className="text-destructive">*</span>
              </label>
              <NativeSelect
                value={vm.contaBancariaId}
                onChange={(e) => vm.setContaBancariaId(e.target.value)}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium"
              >
                <option value="">Selecione a conta recebedora...</option>
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
                <span>Data do Recebimento</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={vm.dataDeposito}
                onChange={(e) => vm.setDataDeposito(e.target.value)}
                className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Observação do Lote
              </label>
              <Textarea
                placeholder="Ex: Conciliação de depósitos do extrato do dia..."
                value={vm.observacao}
                onChange={(e) => vm.setObservacao(e.target.value)}
                rows={2}
                className="rounded-[18px] bg-background border-border text-xs sm:text-sm resize-none font-medium"
              />
            </div>

            <div className="p-4 rounded-[18px] bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Faturas Selecionadas:</span>
                <span className="font-bold text-foreground">{vm.totalFaturasSelecionadas}</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-foreground">Total do Lote:</span>
                <span className="font-extrabold text-base text-primary">
                  {formatCurrency(vm.totalAlocado)}
                </span>
              </div>
            </div>

            {vm.acertosIntercompany.length > 0 && (
              <div className="space-y-2 pt-1">
                {vm.acertosIntercompany.map((acerto, idx) => (
                  <Banner
                    key={idx}
                    variant="info"
                    title="Acerto entre Empresas Detectado"
                    description={`Pagamento recebido por ${acerto.origem} para fatura de ${acerto.destino}. Um acerto de ${formatCurrency(acerto.valor)} será gerado.`}
                  />
                ))}
              </div>
            )}

            <Button
              type="button"
              onClick={vm.handleSubmit}
              disabled={
                vm.isSubmitting ||
                !vm.contaBancariaId ||
                vm.totalFaturasSelecionadas === 0 ||
                vm.totalAlocado <= 0
              }
              className="w-full h-12 rounded-[18px] font-bold text-sm shadow-xs cursor-pointer gap-2"
            >
              <Layers className="h-4 w-4" />
              <span>
                {vm.isSubmitting
                  ? "Processando..."
                  : `Liquidar ${vm.totalFaturasSelecionadas} Fatura(s) (${formatCurrency(vm.totalAlocado)})`}
              </span>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-[24px] border-border shadow-xs bg-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold">
                    Faturas da Competência ({vm.faturasEmAberto.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Marque os clientes que pagaram para somar e liquidar em um único lote
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={vm.handleToggleSelectAll}
                    disabled={vm.faturasEmAberto.length === 0}
                    className="h-9 rounded-[14px] text-xs font-semibold border-border hover:bg-muted gap-1.5 cursor-pointer"
                  >
                    {vm.isAllSelected ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Desmarcar Todas</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Selecionar Todas</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3">
                <div className="sm:col-span-5">
                  <TableSearchInput
                    value={vm.searchCliente}
                    onChange={vm.setSearchCliente}
                    placeholder="Filtrar por nome do cliente..."
                    className="h-10 rounded-[14px]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <NativeSelect
                    value={vm.periodoFiltro}
                    onChange={(e) => vm.setPeriodoFiltro(e.target.value)}
                    className="h-10 rounded-[14px] bg-background border-border text-xs font-medium"
                  >
                    <option value={FILTRO_PERIODO_FATURA.TODOS}>Todos os Períodos</option>
                    <option value={FILTRO_PERIODO_FATURA.QUINZENA_1}>1ª Quinzena</option>
                    <option value={FILTRO_PERIODO_FATURA.QUINZENA_2}>2ª Quinzena</option>
                    <option value={FILTRO_PERIODO_FATURA.MENSAL}>Mensal</option>
                    <option value={FILTRO_PERIODO_FATURA.SEMANA_1}>1ª Semana</option>
                    <option value={FILTRO_PERIODO_FATURA.SEMANA_2}>2ª Semana</option>
                    <option value={FILTRO_PERIODO_FATURA.SEMANA_3}>3ª Semana</option>
                    <option value={FILTRO_PERIODO_FATURA.SEMANA_4}>4ª Semana</option>
                    <option value={FILTRO_PERIODO_FATURA.SEMANA_5}>5ª Semana</option>
                  </NativeSelect>
                </div>

                <div className="sm:col-span-2">
                  <NativeSelect
                    value={String(vm.mes)}
                    onChange={(e) => vm.setMes(Number(e.target.value))}
                    className="h-10 rounded-[14px] bg-background border-border text-xs font-medium"
                  >
                    {meses.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {m}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <div className="sm:col-span-2">
                  <NativeSelect
                    value={String(vm.ano)}
                    onChange={(e) => vm.setAno(Number(e.target.value))}
                    className="h-10 rounded-[14px] bg-background border-border text-xs font-medium"
                  >
                    {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
                      <option key={a} value={String(a)}>
                        {a}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border border-t border-border max-h-[550px] overflow-y-auto">
                {vm.isLoadingFaturas ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Carregando faturas e previsões contratuais...
                  </div>
                ) : vm.faturasEmAberto.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      Nenhuma fatura encontrada
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Não há faturas ou previsões para {meses[vm.mes - 1]}/{vm.ano}.
                    </p>
                  </div>
                ) : (
                  vm.faturasEmAberto.map((fatura) => {
                    const isSelected = vm.selectedFaturaIds.includes(fatura.id);
                    const saldoDevedor =
                      Math.round(
                        (Number(fatura.valor_faturado || 0) - Number(fatura.valor_pago || 0)) * 100
                      ) / 100;
                    const valorAlocado = vm.alocacoes[fatura.id] ?? 0;

                    return (
                      <div
                        key={fatura.id}
                        className={`p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected ? "bg-primary/5" : "bg-card hover:bg-muted/30"
                          }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => vm.handleToggleSelect(fatura)}
                            className="mt-0.5 sm:mt-0 h-5 w-5 rounded-[6px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                onClick={() => vm.handleToggleSelect(fatura)}
                                className="font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                              >
                                {fatura.cliente?.nome_fantasia || `Cliente #${fatura.cliente_id}`}
                              </span>
                              {fatura.numero_os && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium">
                                  OS #{fatura.numero_os}
                                </span>
                              )}
                              {fatura.is_previsao && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-medium text-amber-600 bg-amber-500/10 border-amber-500/20 gap-1 px-2 py-0.5 rounded-[18px]"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Previsão
                                </Badge>
                              )}
                              <span className="text-[11px] text-muted-foreground font-medium">
                                • {getFaturaPeriodoTexto(fatura.tipo_periodo, fatura.numero_periodo, fatura.quinzena)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                              <span>
                                Vencimento:{" "}
                                <strong className="text-foreground">
                                  {formatDateToBR(fatura.data_vencimento)}
                                </strong>
                              </span>
                              <span>
                                Saldo:{" "}
                                <strong className={saldoDevedor > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                                  {formatCurrency(saldoDevedor)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Valor a Baixar:
                          </span>
                          <div className="w-36">
                            <MoneyInput
                              value={valorAlocado}
                              onChange={(val) => vm.handleAlocacaoChange(fatura.id, val)}
                              placeholder="0,00"
                              className={`h-10 rounded-[14px] text-xs font-medium ${isSelected
                                  ? "border-primary bg-background shadow-xs text-primary font-semibold"
                                  : "bg-background border-border text-muted-foreground"
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LiquidacaoLoteTab;

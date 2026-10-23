import { useState } from "react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Banner } from "@/components/ui/Banner";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { meses } from "@/utils/formatters/constants";
import { getMessage } from "@/constants/messages";
import { Wallet, AlertCircle, Clock, Store, History, Receipt } from "lucide-react";
import {
  useFinancialReportView,
  OcorrenciaComTipo,
} from "@/hooks/ui/financeiro";
import { ExtratoPrintable } from "./view/ExtratoPrintable";
import { ExtratoKpis } from "./view/ExtratoKpis";
import { ExtratoTurnosTab } from "./view/tabs/ExtratoTurnosTab";
import { ExtratoConveniosTab } from "./view/tabs/ExtratoConveniosTab";
import { ExtratoAvulsosTab } from "./view/tabs/ExtratoAvulsosTab";
import { ExtratoConsolidadoTab } from "./view/tabs/ExtratoConsolidadoTab";

export interface FinancialReportViewProps {
  usuarioId?: string;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  selectedMonth?: number;
  selectedYear?: number;
  modoComprovanteRenda?: boolean;
  onToggleModoComprovanteRenda?: () => void;
}

export function FinancialReportView({
  usuarioId,
  colaboradorNome,
  cpf,
  cargo,
  selectedMonth: propMonth,
  selectedYear: propYear,
  modoComprovanteRenda = false,
  onToggleModoComprovanteRenda,
}: FinancialReportViewProps) {
  const [activeTab, setActiveTab] = useState("turnos");

  const vm = useFinancialReportView({
    usuarioId,
    propMonth,
    propYear,
    modoComprovanteRenda,
  });

  return (
    <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
      <div className="space-y-6">
        {!propMonth && !propYear && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <p className="text-sm font-semibold text-foreground">Período</p>
              <p className="text-xs text-muted-foreground">Referência do cálculo</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <NativeSelect
                value={String(vm.selectedMonth)}
                onChange={(e) => vm.setSelectedMonth(Number(e.target.value))}
                className="h-11 flex-1 sm:w-[150px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
              >
                {meses.map((label, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {label}
                  </option>
                ))}
              </NativeSelect>

              <NativeSelect
                value={String(vm.selectedYear)}
                onChange={(e) => vm.setSelectedYear(Number(e.target.value))}
                className="h-11 w-[90px] sm:w-[110px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
              >
                {[new Date().getFullYear(), new Date().getFullYear() - 1].map((ano) => (
                  <option key={ano} value={String(ano)}>
                    {ano}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        )}

        {!usuarioId ? (
          <UnifiedEmptyState
            icon={Wallet}
            title="Selecione um colaborador"
            description="Escolha um colaborador para visualizar o rascunho do fechamento financeiro."
          />
        ) : vm.isLoading ? (
          <ListSkeleton />
        ) : vm.extrato ? (
          <div className="space-y-6">
            {modoComprovanteRenda && (
              <Banner
                variant="info"
                className="print:hidden"
                title="Modo Comprovante de Renda ativo"
                description="Exibindo exclusivamente o valor fixo contratual, ocultando descontos, convênios e lançamentos variáveis."
                onClose={onToggleModoComprovanteRenda}
              />
            )}

            <ExtratoPrintable
              modoComprovanteRenda={modoComprovanteRenda}
              colaboradorNome={colaboradorNome}
              cpf={cpf}
              cargo={cargo}
              mes={vm.selectedMonth}
              ano={vm.selectedYear}
              extrato={vm.extrato}
              lancamentosConsolidados={vm.lancamentosConsolidados}
            />

            <div className="print:hidden space-y-6">
              <ExtratoKpis
                extrato={vm.extrato}
                modoComprovanteRenda={modoComprovanteRenda}
                can={vm.can}
                isConfirmingAdiantamento={vm.isConfirmingAdiantamento}
                isPaying={vm.isPaying}
                isUndoingPayment={vm.isUndoingPayment}
                onConfirmarAdiantamento={vm.handleConfirmarAdiantamento}
                onDesconfirmarAdiantamento={vm.handleDesconfirmarAdiantamento}
                onPayment={vm.handlePayment}
                onDesfazerPagamento={vm.handleDesfazerPagamento}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-8">
                <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none] print:hidden">
                  <TabsTrigger
                    value="turnos"
                    className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Turnos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="convenios"
                    className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                  >
                    <Store className="h-4 w-4" />
                    <span>Convênios</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="avulsos"
                    className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                  >
                    <History className="h-4 w-4" />
                    <span>Avulsos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="consolidado"
                    className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Consolidado</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="turnos" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300 print:hidden">
                  <ExtratoTurnosTab
                    extrato={vm.extrato}
                    selectedMonth={vm.selectedMonth}
                    selectedYear={vm.selectedYear}
                    isSuperAdmin={vm.isSuperAdmin}
                    onOpenOccurrenceDetails={(occ: OcorrenciaComTipo) =>
                      vm.openOccurrenceDetailsDialog({
                        occurrence: occ,
                        onDelete: !occ.is_virtual ? () => vm.handleDeleteOcorrencia(occ) : undefined,
                        onEdit: !occ.is_virtual ? () => vm.handleEditOcorrencia(occ) : undefined,
                      })
                    }
                  />
                </TabsContent>

                <TabsContent value="convenios" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300 print:hidden">
                  <ExtratoConveniosTab extrato={vm.extrato} />
                </TabsContent>

                <TabsContent value="avulsos" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300 print:hidden">
                  <ExtratoAvulsosTab
                    extrato={vm.extrato}
                    isSuperAdmin={vm.isSuperAdmin}
                    onOpenOccurrenceDetails={(occ: OcorrenciaComTipo) =>
                      vm.openOccurrenceDetailsDialog({
                        occurrence: occ,
                        onDelete: !occ.is_virtual ? () => vm.handleDeleteOcorrencia(occ) : undefined,
                        onEdit: !occ.is_virtual ? () => vm.handleEditOcorrencia(occ) : undefined,
                      })
                    }
                  />
                </TabsContent>

                <TabsContent value="consolidado" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <ExtratoConsolidadoTab
                    extrato={vm.extrato}
                    lancamentosConsolidados={vm.lancamentosConsolidados}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <UnifiedEmptyState
            icon={AlertCircle}
            title={getMessage("financeiro.erro.carregar")}
            description="Não foi possível processar o rascunho financeiro."
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}

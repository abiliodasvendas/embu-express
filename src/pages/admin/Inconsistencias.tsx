import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { DateNavigation } from "@/components/common/DateNavigation";
import { ListSkeleton } from "@/components/skeletons";
import { useLayout } from "@/contexts/LayoutContext";
import { useInconsistenciesViewModel } from "@/hooks";
import { AlertTriangle, Search } from "lucide-react";
import { useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";

export default function Inconsistencias() {
  const { setPageTitle } = useLayout();
  const vm = useInconsistenciesViewModel();

  useEffect(() => {
    setPageTitle("Gestão de Inconsistências");
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-3xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <DateNavigation date={vm.date} onNavigate={vm.setDate} />

            <div className="flex items-center gap-3 w-full md:w-auto">
              {vm.hasActiveFilters && (
                <button
                  onClick={vm.clearFilters}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest px-2"
                >
                  Limpar
                </button>
              )}
              <div className="relative w-full md:w-72">
                <Combobox
                  options={[{ value: "", label: "Todos os Colaboradores" }, ...vm.records.map(r => ({ value: r.usuario?.nome_completo || "", label: r.usuario?.nome_completo || "" }))]}
                  value={vm.searchTerm}
                  onSelect={(val) => vm.setSearchTerm(val || "")}
                  placeholder="Buscar por colaborador..."
                  searchPlaceholder="Digite o nome..."
                  emptyText="Nenhum pendente encontrado."
                  startIcon={<Search className="h-4 w-4 text-gray-400" />}
                  className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none hover:bg-gray-50 transition-none pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm shadow-orange-500/5">
        <div className="p-2 bg-orange-100 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
        </div>
        <div>
          <h4 className="text-sm font-black text-orange-900 uppercase tracking-wider mb-1">O que são inconsistências?</h4>
          <p className="text-xs text-orange-800 font-medium leading-relaxed opacity-80">
            Listagem de colaboradores que iniciaram o turno mas não registraram a saída após 4 horas do horário previsto ou excederam 14h de jornada.
            Estes registros requerem ajuste manual para fechar o saldo corretamente.
          </p>
        </div>
      </div>

      {vm.isLoading ? (
        <ListSkeleton />
      ) : vm.filteredRecords.length === 0 ? (
        <UnifiedEmptyState
          icon={AlertTriangle}
          title={vm.searchTerm ? "Nenhuma pendência para esta busca" : "Nenhuma pendência encontrada"}
          description={vm.searchTerm ? "Tente buscar por outro nome ou limpe a pesquisa." : "Todos os colaboradores desta data registraram a atividade corretamente ou não iniciaram."}
        />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <TimeTrackingList records={vm.filteredRecords} date={vm.date} />
        </div>
      )}
    </div>
  );
}

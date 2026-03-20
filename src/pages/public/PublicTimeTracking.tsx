import { useParams } from "react-router-dom";
import { FilterX, Timer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { FilterOptions } from "@/types/enums";
import { DateNavigation } from "@/components/common/DateNavigation";
import { useTimeTrackingViewModel } from "@/hooks";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";

export default function PublicTimeTracking() {
    const { uuid } = useParams();

    // Unified Logic Hook (ViewModel)
    const vm = useTimeTrackingViewModel({
        uuid,
        syncWithUrl: false // No URL sync for public view to keep it clean
    });

    return (
        <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* Header & Main Filters */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <DateNavigation date={vm.date} onNavigate={vm.setDate} />

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            {vm.hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={vm.clearAllFilters}
                                    className="text-gray-500 hover:text-gray-900 h-11 px-3 order-last sm:order-none w-full sm:w-auto"
                                >
                                    <FilterX className="h-4 w-4 mr-1.5" />
                                    Limpar
                                </Button>
                            )}

                            <div className="relative w-full sm:w-64 lg:w-72">
                                <Combobox
                                    options={[
                                        { value: FilterOptions.TODOS, label: "Todos os Colaboradores" },
                                        ...(vm.collaborators || []).map(f => ({ value: f.id.toString(), label: f.nome_completo }))
                                    ]}
                                    value={vm.selectedUsuario === FilterOptions.TODOS ? "" : vm.selectedUsuario}
                                    onSelect={(val) => vm.setSelectedUsuario(val || FilterOptions.TODOS)}
                                    placeholder="Buscar colaborador..."
                                    searchPlaceholder="Digite o nome..."
                                    emptyText="Nenhum colaborador encontrado."
                                    startIcon={<Search className="h-4 w-4 text-gray-400" />}
                                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm text-gray-600 hover:bg-white transition-none pl-9"
                                />
                            </div>

                            <Select value={vm.selectedTurno} onValueChange={vm.setSelectedTurno}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-600 shadow-none w-full sm:w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-gray-400" />
                                        <SelectValue placeholder="Todos os turnos" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 z-[1001]">
                                    <SelectItem value={FilterOptions.TODOS} className="font-medium">Todos os turnos</SelectItem>
                                    {vm.uniqueShifts.map((label: string) => (
                                        <SelectItem key={label} value={label} className="font-medium text-gray-600">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <TimeTrackingKpiFilters
                    activeFilter={vm.activeKpiFilter}
                    counts={vm.dynamicKpiCounts}
                    onFilterClick={vm.handleKpiClick}
                />

                {/* List Container */}
                <div className="space-y-4">
                    {vm.isLoading ? (
                        <ListSkeleton />
                    ) : (
                        <TimeTrackingList
                            records={vm.filteredRecords}
                            date={vm.date}
                            showActions={false}
                        />
                    )}
                </div>
            </div>
        </PullToRefreshWrapper>
    );
}

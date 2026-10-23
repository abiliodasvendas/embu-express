import { useParams } from "react-router-dom";
import { FilterX, Timer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { NativeSelect } from "@/components/ui/native-select";
import { ListSkeleton } from "@/components/skeletons";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { FilterOptions } from "@/types/enums";
import { DateNavigation } from "@/components/common/DateNavigation";
import { useTimeTrackingViewModel } from "@/hooks";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";

export default function PublicTimeTracking() {
    const { uuid } = useParams();

    const vm = useTimeTrackingViewModel({
        uuid,
        syncWithUrl: false
    });

    return (
        <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <DateNavigation date={vm.date} onNavigate={vm.setDate} />

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            {vm.hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={vm.clearAllFilters}
                                    className="text-muted-foreground hover:text-foreground h-11 px-3 order-last sm:order-none w-full sm:w-auto rounded-[18px]"
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
                                    startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                                    className="h-11 rounded-[18px] bg-card border-border font-medium shadow-xs text-xs sm:text-sm text-foreground hover:bg-card pl-9"
                                />
                            </div>

                            <NativeSelect
                                value={vm.selectedTurno}
                                onChange={(e) => vm.setSelectedTurno(e.target.value)}
                                icon={<Timer className="h-4 w-4" />}
                                variant="white"
                                className="h-11 rounded-[18px] w-full sm:w-[200px] text-xs sm:text-sm"
                            >
                                <option value={FilterOptions.TODOS}>Todos os turnos</option>
                                {vm.uniqueShifts.map((label: string) => (
                                    <option key={label} value={label}>{label}</option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </div>

                <TimeTrackingKpiFilters
                    activeFilter={vm.activeKpiFilter}
                    counts={vm.dynamicKpiCounts}
                    onFilterClick={vm.handleKpiClick}
                />

                <div className="space-y-4">
                    {vm.isLoading ? (
                        <ListSkeleton />
                    ) : (
                        <TimeTrackingList
                            records={vm.filteredRecords}
                            date={vm.date}
                            showActions={false}
                            manualAbsenceIds={vm.manualAbsenceIds}
                        />
                    )}
                </div>
            </div>
        </PullToRefreshWrapper>
    );
}

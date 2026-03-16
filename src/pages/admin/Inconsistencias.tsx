import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { DateNavigation } from "@/components/common/DateNavigation";
import { ListSkeleton } from "@/components/skeletons";
import { useLayout } from "@/contexts/LayoutContext";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { FILTER_OPTIONS } from "@/constants/ponto";
import { format, subDays } from "date-fns";
import { AlertTriangle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function Inconsistencias() {
  const { setPageTitle } = useLayout();
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPageTitle("Gestão de Inconsistências");
  }, [setPageTitle]);

  // Buscamos apenas registros com Falta de Saída
  const { data: records, isLoading } = useTimeRecords({
      date: format(date, "yyyy-MM-dd"),
      statusSaida: FILTER_OPTIONS.FALTA_SAIDA,
      incluirTodos: true
  });

  const filteredRecords = records?.filter(r => 
    r.usuario?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.usuario?.cpf?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <DateNavigation date={date} onNavigate={setDate} />
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nome ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-orange-900">O que são inconsistências?</h4>
          <p className="text-xs text-orange-700 font-medium">
            Listagem de colaboradores que iniciaram o turno mas não registraram a saída após 4 horas do horário previsto. 
            Estes registros requerem ajuste manual para fechar o saldo de horas.
          </p>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : !filteredRecords || filteredRecords.length === 0 ? (
        <UnifiedEmptyState 
          icon={AlertTriangle}
          title="Nenhuma pendência encontrada"
          description="Todos os colaboradores desta data registraram o ponto corretamente."
        />
      ) : (
        <TimeTrackingList records={filteredRecords} />
      )}
    </div>
  );
}

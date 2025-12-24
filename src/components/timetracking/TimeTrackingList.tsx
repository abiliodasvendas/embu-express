import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
import { RegistroPonto } from "@/types/database";
import { getStatusText } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, User } from "lucide-react";

interface TimeTrackingListProps {
  records: RegistroPonto[];
}

export function TimeTrackingList({ records }: TimeTrackingListProps) {
  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "VERDE": return "bg-green-500 text-white hover:bg-green-600";
      case "AMARELO": return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "VERMELHO": return "bg-red-500 text-white hover:bg-red-600";
      default: return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status?: string | null) => {
    if (!status) return "N/A";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    return format(new Date(isoString), "HH:mm");
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return format(new Date(year, month - 1, day), "dd 'de' MMM", { locale: ptBR });
  };

  return (
    <ResponsiveDataList
      data={records}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(record) => (
        <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{record.usuario?.nome_completo}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(record.data_referencia)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Entrada</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">{formatTime(record.entrada_hora)}</span>
                <Badge className={getStatusColor(record.status_entrada)}>{getStatusText(record.status_entrada || "cinza")}</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-0">
               <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 text-red-400" />
                <span>Saída</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">{formatTime(record.saida_hora)}</span>
                <Badge className={getStatusColor(record.status_saida)}>{getStatusText(record.status_saida || "cinza")}</Badge>
              </div>
            </div>
          </div>

          {(record.entrada_km || record.saida_km) && (
             <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                   <MapPin className="w-3 h-3" />
                   <span>KM: {record.entrada_km || "-"} / {record.saida_km || "-"}</span>
                </div>
                <div className="flex-1 text-right text-blue-500 font-medium truncate">
                   {record.usuario?.cliente?.nome_fantasia || "Administrativo"}
                </div>
             </div>
          )}
        </div>
      )}
    >
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100 text-left">
              <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Funcionário</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entrada</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Saída</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-4 pl-6 align-middle text-sm text-gray-900 font-medium">
                  {formatDate(record.data_referencia)}
                </td>
                <td className="px-6 py-4 align-middle">
                   <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                        {record.usuario?.nome_completo?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{record.usuario?.nome_completo}</span>
                   </div>
                </td>
                <td className="px-6 py-4 align-middle">
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{formatTime(record.entrada_hora)}</span>
                      <Badge className={getStatusColor(record.status_entrada)}>{getStatusText(record.status_entrada || "cinza")}</Badge>
                   </div>
                </td>
                <td className="px-6 py-4 align-middle">
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{formatTime(record.saida_hora)}</span>
                      <Badge className={getStatusColor(record.status_saida)}>{getStatusText(record.status_saida || "cinza")}</Badge>
                   </div>
                </td>
                <td className="px-6 py-4 align-middle text-sm text-gray-600">
                  {record.usuario?.cliente?.nome_fantasia || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}

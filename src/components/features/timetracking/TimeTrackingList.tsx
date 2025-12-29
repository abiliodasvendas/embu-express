import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { EditTimeRecordDialog } from "@/components/dialogs/EditTimeRecordDialog";
import { TimeRecordDetailsDialog } from "@/components/dialogs/TimeRecordDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useDialogClose } from "@/hooks/ui/useDialogClose";
import { RegistroPonto } from "@/types/database";
import { calculateTotalTime, formatMinutes, formatTime, getStatusColorClass, getStatusLabel } from "@/utils/ponto";
import { Clock, Timer } from "lucide-react";
import { useState } from "react";

const renderStatusTooltip = (details: any, type: 'entrada' | 'saida', timeIso?: string | null) => {
    const info = details?.[type];
    if (!info || !info.turno_base) return null;

    const diff = info.diff_minutos;
    const isLateOrExtra = diff > 0;
    const sign = isLateOrExtra ? "+" : "";

    return (
        <div className="text-xs space-y-1">
            <p><span className="font-semibold">Marcado às:</span> {formatTime(timeIso)}</p>
            <p><span className="font-semibold">Turno Base:</span> {info.turno_base.substring(0, 5)}</p>
            <p>
                <span className="font-semibold">{type === 'entrada' ? 'Atraso:' : 'Hora Extra:'}</span> 
                <span className={isLateOrExtra ? "text-red-500 ml-1" : "text-green-500 ml-1"}>
                    {sign}{diff} min
                </span>
            </p>
            <p className="text-[10px] text-gray-400">Tolerância: {info.tolerancia} min</p>
        </div>
    );
};

interface TimeTrackingListProps {
  records: RegistroPonto[];
}

const TimeRecordMobileItem = ({ 
  record, 
  onDetails,
  onEdit,
  onDelete
}: { 
  record: RegistroPonto;
  onDetails: (r: RegistroPonto) => void;
  onEdit: (r: RegistroPonto) => void;
  onDelete: (r: RegistroPonto) => void;
}) => {
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

  return (
    <MobileActionItem actions={actions}>
      <div onClick={() => onDetails(record)} className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
               <div className="flex flex-col gap-0.5">
                 <span className="text-sm font-bold text-gray-900">{record.usuario?.nome_completo}</span>
                 {record.usuario?.cliente?.nome_fantasia && (
                    <span className="text-[10px] text-gray-400">
                        {record.usuario.cliente.nome_fantasia}
                    </span>
                 )}
               </div>
               
               <ActionsDropdown actions={actions} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Entrada</span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="font-bold text-gray-700 text-lg">{formatTime(record.entrada_hora)}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className={`cursor-help text-[10px] px-1.5 py-0 rounded-md font-normal border ${getStatusColorClass(record.status_entrada)}`}>
                                        {getStatusLabel(record.status_entrada, 'entrada')}
                                    </Badge>
                                </TooltipTrigger>
                                {record.detalhes_calculo?.entrada && (
                                    <TooltipContent className="hidden sm:block">
                                        {renderStatusTooltip(record.detalhes_calculo, 'entrada', record.entrada_hora)}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                </div>
              </div>

              <div className="space-y-1 pt-0">
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 text-red-400" />
                  <span>Saída</span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="font-bold text-gray-700 text-lg">{formatTime(record.saida_hora)}</span>
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Badge variant="outline" className={`cursor-help text-[10px] px-1.5 py-0 rounded-md font-normal border ${getStatusColorClass(record.status_saida)}`}>
                                  {getStatusLabel(record.status_saida, 'saida')}
                              </Badge>
                          </TooltipTrigger>
                          {record.detalhes_calculo?.saida && (
                              <TooltipContent className="hidden sm:block">
                                  {renderStatusTooltip(record.detalhes_calculo, 'saida', record.saida_hora)}
                              </TooltipContent>
                          )}
                      </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
              
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       {/* Mobile Balance */}
                         {record.saldo_minutos !== undefined && record.saldo_minutos !== null && (
                             <Badge variant="outline" className={`${record.saldo_minutos >= 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                                {formatMinutes(record.saldo_minutos)}
                             </Badge>
                         )}
                   </div>

                   <div className="flex items-center gap-2 text-xs text-slate-500">
                       <span className="font-medium">Total:</span>
                        {record.saida_hora ? (
                           <div className="flex items-center gap-1">
                               <Timer className="w-3 h-3" />
                               {calculateTotalTime(record.entrada_hora, record.saida_hora)}
                           </div>
                       ) : (
                           <span>Em andamento</span>
                       )}
                   </div>
              </div>
          </div>
    </MobileActionItem>
  );
};

const TimeRecordTableRow = ({ 
  record, 
  onDetails,
  onEdit,
  onDelete
}: { 
  record: RegistroPonto;
  onDetails: (r: RegistroPonto) => void;
  onEdit: (r: RegistroPonto) => void;
  onDelete: (r: RegistroPonto) => void;
}) => {
   const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

   return (
    <tr 
        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
        onClick={() => onDetails(record)}
    >
      <td className="py-4 pl-6 align-middle relative">
         <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-gray-700">{record.usuario?.nome_completo}</span>
          {record.usuario?.cliente?.nome_fantasia && (
              <span className="text-[10px] text-gray-400">
                  {record.usuario.cliente.nome_fantasia}
              </span>
          )}
         </div>
      </td>
      <td className="px-6 py-4 align-middle">
         <div className="flex flex-col items-start gap-1">
            <span className="text-base font-bold text-gray-700">{formatTime(record.entrada_hora)}</span>
            
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge variant="outline" className={`cursor-help text-[10px] px-2 py-0.5 rounded-md font-medium border ${getStatusColorClass(record.status_entrada)}`}>
                           {getStatusLabel(record.status_entrada, 'entrada')}
                        </Badge>
                    </TooltipTrigger>
                    {record.detalhes_calculo?.entrada && (
                        <TooltipContent>
                            {renderStatusTooltip(record.detalhes_calculo, 'entrada', record.entrada_hora)}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
         </div>
      </td>
      <td className="px-6 py-4 align-middle">
         <div className="flex flex-col items-start gap-1">
            <span className="text-base font-bold text-gray-700">{formatTime(record.saida_hora)}</span>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Badge variant="outline" className={`cursor-help text-[10px] px-2 py-0.5 rounded-md font-medium border ${getStatusColorClass(record.status_saida)}`}>
                           {getStatusLabel(record.status_saida, 'saida')}
                        </Badge>
                    </TooltipTrigger>
                    {record.detalhes_calculo?.saida && (
                        <TooltipContent>
                            {renderStatusTooltip(record.detalhes_calculo, 'saida', record.saida_hora)}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
         </div>
      </td>
       <td className="px-6 py-4 align-middle">
         <div className="flex flex-col items-start gap-0.5">
            {/* Saldo Primary */}
            {record.saldo_minutos !== undefined && record.saldo_minutos !== null ? (
                 <span className={`text-sm font-bold ${record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {formatMinutes(record.saldo_minutos)}
                 </span>
            ) : (
                 <span className="text-gray-300 text-sm font-bold">--</span>
            )}
            
            {/* Total Secondary */}
            <span className="text-[10px] text-gray-400">
                 Total: {calculateTotalTime(record.entrada_hora, record.saida_hora) || "Em andamento"}
            </span>
         </div>
      </td>
      <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
           <ActionsDropdown actions={actions} />
      </td>
    </tr>
   );
};


// ...

export function TimeTrackingList({ records }: TimeTrackingListProps) {
  const [editingRecord, setEditingRecord] = useState<RegistroPonto | null>(null);
  const [detailsRecord, setDetailsRecord] = useState<RegistroPonto | null>(null);
  const { closeDialog } = useDialogClose();

   const { mutateAsync: deletePonto } = useDeletePonto();

  /* 
     Fix Layering: Do not close details when opening edit. 
     Radix Dialogs stack automatically. ensure z-index is handled if needed, usually is.
  */
  const handleEditFromDetails = (record: RegistroPonto) => {
      // setDetailsRecord(null); // Keep details open behind
      setEditingRecord(record); 
  };

  const [recordToDelete, setRecordToDelete] = useState<RegistroPonto | null>(null);

  const confirmDelete = async () => {
    if (recordToDelete) {
        await deletePonto(recordToDelete.id);
        
        // Use safe close to prevent frozen screen
        closeDialog(() => {
            setRecordToDelete(null);
            setDetailsRecord(null);
        });
    }
  };

  const handleDelete = (record: RegistroPonto) => {
      // Abre o dialog de confirmação
      setRecordToDelete(record);
  };

  return (
    <>
      <ResponsiveDataList
        data={records}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(record) => (
          <TimeRecordMobileItem 
            key={record.id} 
            record={record} 
            onDetails={setDetailsRecord}
            onEdit={setEditingRecord} // Ensure edit uses state
            onDelete={handleDelete}
           />
        )}
      >
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100 text-left">
                <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[40%]">Funcionário</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Entrada</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Saída</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo / Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((record) => (
                <TimeRecordTableRow 
                  key={record.id} 
                  record={record} 
                  onDetails={setDetailsRecord} 
                  onEdit={setEditingRecord}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </ResponsiveDataList>
      
      <TimeRecordDetailsDialog 
        isOpen={!!detailsRecord}
        onClose={() => setDetailsRecord(null)}
        record={detailsRecord}
        onEdit={handleEditFromDetails}
        onDelete={handleDelete}
      />

      <EditTimeRecordDialog 
        isOpen={!!editingRecord} 
        onClose={() => setEditingRecord(null)} 
        record={editingRecord} 
      />

      <ConfirmationDialog
            open={!!recordToDelete}
            onOpenChange={(open) => !open && setRecordToDelete(null)}
            title="Excluir Registro"
            description="Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita."
            onConfirm={confirmDelete}
            confirmText="Sim, excluir"
            cancelText="Cancelar"
            variant="destructive"
            isLoading={false} // useDeletePonto async handled in promise
       />
    </>
  );
}

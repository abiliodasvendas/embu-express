import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
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

const StatusBadgeWithTooltip = ({
  status,
  type,
  details,
  timeIso
}: {
  status: string,
  type: 'entrada' | 'saida',
  details: any,
  timeIso?: string | null
}) => {
  const hasDetails = !!(details?.[type] && details?.[type]?.turno_base);

  const BadgeComponent = (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-md font-medium border",
        getStatusColorClass(status),
        hasDetails ? "cursor-help" : "cursor-default"
      )}
    >
      {getStatusLabel(status, type)}
    </Badge>
  );

  if (!hasDetails) return BadgeComponent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeComponent}
        </TooltipTrigger>
        <TooltipContent className="hidden sm:block">
          {renderStatusTooltip(details, type, timeIso)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  const isAusente = (record as any).ausente;
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

  const content = (
    <div 
      onClick={isAusente ? undefined : () => onDetails(record)} 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all",
        !isAusente && "cursor-pointer active:scale-[0.98]",
        isAusente && "opacity-60 grayscale-[0.5]"
      )}
    >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-gray-900">{record.usuario?.nome_completo}</span>
            {record.cliente?.nome_fantasia && (
              <span className="text-[10px] text-gray-400">
                {record.cliente.nome_fantasia}
              </span>
            )}
          </div>


        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Entrada</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-gray-700 text-lg">{formatTime(record.entrada_hora)}</span>
              <StatusBadgeWithTooltip
                status={record.status_entrada}
                type="entrada"
                details={record.detalhes_calculo}
                timeIso={record.entrada_hora}
              />
            </div>
          </div>

          <div className="space-y-1 pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Saída</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-gray-700 text-lg">{formatTime(record.saida_hora)}</span>
              <StatusBadgeWithTooltip
                status={record.status_saida}
                type="saida"
                details={record.detalhes_calculo}
                timeIso={record.saida_hora}
              />
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
                {record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--"}
              </div>
            ) : (
              <span>{(record as any).ausente ? "Ausente" : "Em andamento"}</span>
            )}
          </div>
        </div>
      </div>
  );

  if (isAusente) return content;

  return (
    <MobileActionItem actions={actions}>
      {content}
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
  const isAusente = (record as any).ausente;
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

  return (
    <tr
      className={cn(
        "transition-colors group",
        isAusente ? "opacity-60 grayscale-[0.5] cursor-default" : "hover:bg-gray-50/80 cursor-pointer"
      )}
      onClick={isAusente ? undefined : () => onDetails(record)}
    >
      <td className="py-4 pl-6 align-middle relative">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-gray-700">{record.usuario?.nome_completo}</span>
          {record.cliente?.nome_fantasia && (
            <span className="text-[10px] text-gray-400">
              {record.cliente.nome_fantasia}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0 border-none h-5">
           {record.detalhes_calculo?.entrada?.turno_base 
              ? `${record.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${(record.detalhes_calculo.saida?.turno_base || '00:00:00').substring(0, 5)}`
              : 'Turno NI'}
        </Badge>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-start gap-1">
          <span className="text-base font-bold text-gray-700">{formatTime(record.entrada_hora)}</span>
          <StatusBadgeWithTooltip
            status={record.status_entrada}
            type="entrada"
            details={record.detalhes_calculo}
            timeIso={record.entrada_hora}
          />
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-start gap-1">
          <span className="text-base font-bold text-gray-700">{formatTime(record.saida_hora)}</span>
          <StatusBadgeWithTooltip
            status={record.status_saida}
            type="saida"
            details={record.detalhes_calculo}
            timeIso={record.saida_hora}
          />
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
            Total: {record.saida_hora ? (record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--") : (record as any).ausente ? "Ausente" : "Em andamento"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
        {!isAusente && <ActionsDropdown actions={actions} />}
      </td>
    </tr>
  );
};


// ...

export function TimeTrackingList({ records }: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openEditTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const { mutateAsync: deletePonto } = useDeletePonto();

  /* 
     Fix Layering: Do not close details when opening edit. 
     Radix Dialogs stack automatically. ensure z-index is handled if needed, usually is.
  */
  const handleEditFromDetails = (record: RegistroPonto) => {
    openEditTimeRecordDialog({ record });
  };

  const handleDelete = (record: RegistroPonto) => {
    openConfirmationDialog({
      title: "Excluir Registro",
      description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deletePonto(record.id);
        closeConfirmationDialog();
      }
    });
  };

  const openDetails = (record: RegistroPonto) => {
    openTimeRecordDetailsDialog({
      record,
      onEdit: handleEditFromDetails,
      onDelete: handleDelete
    });
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
            onDetails={openDetails}
            onEdit={(record) => openEditTimeRecordDialog({ record })}
            onDelete={handleDelete}
          />
        )}
      >
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100 text-left">
                <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[30%]">Colaborador</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Turno</th>
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
                  onDetails={openDetails}
                  onEdit={(record) => openEditTimeRecordDialog({ record })}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </ResponsiveDataList>
    </>
  );
}

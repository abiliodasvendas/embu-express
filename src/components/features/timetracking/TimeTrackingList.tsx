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
import { PONTO_SIDE, STATUS_PONTO } from "@/constants/ponto";
import { useState } from "react";

const renderStatusTooltip = (details: any, type: typeof PONTO_SIDE.ENTRADA | typeof PONTO_SIDE.SAIDA, timeIso?: string | null) => {
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
        <span className="font-semibold">{type === PONTO_SIDE.ENTRADA ? 'Atraso:' : 'Hora Extra:'}</span>
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
  type: typeof PONTO_SIDE.ENTRADA | typeof PONTO_SIDE.SAIDA,
  details: any,
  timeIso?: string | null
}) => {
  const hasDetails = !!(details?.[type] && details?.[type]?.turno_base);

  const BadgeComponent = (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-md font-medium border",
        getStatusColorClass(status, type),
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
  const isAguardando = record.status_entrada === STATUS_PONTO.CINZA;
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

  const content = (
    <div
      onClick={(!record.entrada_hora) ? undefined : () => onDetails(record)}
      className={cn(
        "bg-white rounded-[2rem] p-5 shadow-sm border border-transparent transition-all active:scale-[0.98]",
        (!record.entrada_hora) ? "cursor-default border-dashed border-gray-100" : "hover:border-blue-100 hover:shadow-md cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm",
            record.entrada_hora ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
          )}>
            {record.usuario?.nome_completo?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">{record.usuario?.nome_completo}</span>
            <span className="text-[10px] text-gray-400 font-medium">{record.cliente?.nome_fantasia}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-gray-50/50 text-gray-400 font-bold border-gray-100 rounded-lg">
          {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5)} - {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="h-3 w-3" /> Entrada
          </span>
          <div className="flex flex-col gap-1.5 min-h-[44px]">
            {record.entrada_hora ? (
              <span className="text-lg font-black text-gray-900">{formatTime(record.entrada_hora)}</span>
            ) : (
              <div className="h-7" />
            )}
            <div className="h-5">
              <StatusBadgeWithTooltip 
                status={record.status_entrada} 
                type={PONTO_SIDE.ENTRADA} 
                details={record.detalhes_calculo}
                timeIso={record.entrada_hora}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 border-l border-gray-50 pl-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="h-3 w-3" /> Saída
          </span>
          <div className="flex flex-col gap-1.5 min-h-[44px]">
            {record.saida_hora ? (
              <span className="text-lg font-black text-gray-900">{formatTime(record.saida_hora)}</span>
            ) : (
              <div className="h-7" />
            )}
            <div className="h-5">
              <StatusBadgeWithTooltip 
                status={record.status_saida} 
                type={PONTO_SIDE.SAIDA} 
                details={record.detalhes_calculo}
                timeIso={record.saida_hora}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile Balance */}
          <div className="h-6 flex items-center justify-center">
            {record.entrada_hora && record.saida_hora && record.saldo_minutos !== undefined && record.saldo_minutos !== null && !record.ausente ? (
              <Badge variant="outline" className={`${record.saldo_minutos >= 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                {formatMinutes(record.saldo_minutos)}
              </Badge>
            ) : (
              <div className="w-12" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 min-h-[16px]">
          {record.entrada_hora && record.saida_hora && (
            <>
              <span className="font-medium">Total:</span>
              <span>{record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!record.entrada_hora) return content;

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
  const isAguardando = record.status_entrada === STATUS_PONTO.CINZA;
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });

  return (
    <tr
      className={cn(
        "transition-colors group",
        (!record.entrada_hora) ? "cursor-default" : "hover:bg-gray-50/80 cursor-pointer"
      )}
      onClick={(!record.entrada_hora) ? undefined : () => onDetails(record)}
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
        <div className="flex flex-col items-start gap-1 min-h-[48px] justify-center">
          {record.entrada_hora ? (
            <span className="text-base font-bold text-gray-700">{formatTime(record.entrada_hora)}</span>
          ) : (
            <div className="h-6" />
          )}
          <div className="h-5">
            <StatusBadgeWithTooltip
              status={record.status_entrada}
              type={PONTO_SIDE.ENTRADA}
              details={record.detalhes_calculo}
              timeIso={record.entrada_hora}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-start gap-1 min-h-[48px] justify-center">
          {record.saida_hora ? (
            <span className="text-base font-bold text-gray-700">{formatTime(record.saida_hora)}</span>
          ) : (
            <div className="h-6" />
          )}
          <div className="h-5">
            <StatusBadgeWithTooltip
              status={record.status_saida}
              type={PONTO_SIDE.SAIDA}
              details={record.detalhes_calculo}
              timeIso={record.saida_hora}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex flex-col items-start gap-0.5 min-h-[40px] justify-center">
          {/* Saldo Primary */}
          {record.entrada_hora && record.saida_hora && record.saldo_minutos !== undefined && record.saldo_minutos !== null && !record.ausente ? (
            <span className={`text-sm font-bold ${record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatMinutes(record.saldo_minutos)}
            </span>
          ) : (
            <div className="h-5" />
          )}

          {/* Total Secondary - Mantemos a altura ocupada para alinhar a linha */}
          <div className="min-h-[12px]">
            {record.entrada_hora && record.saida_hora && (
              <span className="text-[10px] text-gray-400">
                Total: {record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
        {!isAguardando && <ActionsDropdown actions={actions} />}
      </td>
    </tr>
  );
};


// ...

export function TimeTrackingList({ records }: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const { mutateAsync: deletePonto } = useDeletePonto();

  /* 
     Fix Layering: Do not close details when opening edit. 
     Radix Dialogs stack automatically. ensure z-index is handled if needed, usually is.
  */
  const handleEditFromDetails = (record: RegistroPonto) => {
    openTimeRecordDialog({ record });
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
            onEdit={(record) => openTimeRecordDialog({ record })}
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
                  onEdit={(record) => openTimeRecordDialog({ record })}
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

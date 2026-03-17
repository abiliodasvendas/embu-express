import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { Badge } from "@/components/ui/badge";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import { RegistroPonto } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMinutes, formatTime, getManagementStatus, ManagementStatus } from "@/utils/ponto";
import { Clock, FilterX } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";

const TimeRecordCard = ({
  record,
  date,
  onDetails,
  onEdit,
  onDelete
}: {
  record: RegistroPonto;
  date: Date;
  onDetails: (r: RegistroPonto) => void;
  onEdit: (r: RegistroPonto) => void;
  onDelete: (r: RegistroPonto) => void;
}) => {
  const actions = useTimeRecordActions({ record, onDetails, onEdit, onDelete });
  const mStatus = getManagementStatus(record, date);

  const statusConfig: Record<ManagementStatus, { label: string; color: string; bg: string; border: string }> = {
    LATE: { label: "Atrasados", color: "text-amber-600", bg: "bg-amber-50", border: "bg-amber-500" },
    WORKING: { label: "Trabalhando", color: "text-blue-600", bg: "bg-blue-50", border: "bg-blue-500" },
    DONE: { label: "Finalizado", color: "text-gray-400", bg: "bg-gray-100", border: "bg-gray-400" },
    WAITING: { label: "Aguar. Início", color: "text-sky-600", bg: "bg-sky-50", border: "bg-sky-400" },
    ABSENT: { label: "Faltas", color: "text-rose-600", bg: "bg-rose-50", border: "bg-rose-500" },
  };

  const config = statusConfig[mStatus];

  const cardContent = (
    <div
      onClick={() => onDetails(record)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-100 cursor-pointer flex h-full relative"
    >
      {/* Sidebar de Status - Estilo Premium Absoluto */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.border)} />

      <div className="flex-1 p-3 pl-6 flex flex-col h-full justify-between gap-2.5">
        {/* Header: Avatar + Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                <AvatarImage src={record.usuario?.foto_url} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                    {record.usuario?.nome_completo?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{record.usuario?.nome_completo}</h3>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                Turno: {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5) || "--:--"} - {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5) || "--:--"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Badge className={cn("text-[8px] uppercase font-black px-1.5 h-5 rounded-md border-none shrink-0", config.bg, config.color)}>
              {config.label}
            </Badge>
            <ActionsDropdown actions={actions} />
          </div>
        </div>

        {/* Horários: Entrada e Saída (Padronizado com a tela pública) */}
        <div className="flex items-end justify-between border-t border-gray-50 pt-2.5 mt-auto">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Entrada</p>
            <p className={cn("text-base font-black leading-none", record.entrada_hora ? "text-gray-900" : "text-gray-300")}>
              {record.entrada_hora ? formatTime(record.entrada_hora) : (mStatus === 'ABSENT' ? "Faltou" : "Pendente")}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saída</p>
            <p className={cn("text-base font-black leading-none", record.saida_hora ? "text-gray-900" : "text-gray-300")}>
              {record.saida_hora ? formatTime(record.saida_hora) : "--:--"}
            </p>
          </div>
        </div>

        {/* Rodapé: Total e Saldo (Apenas se finalizado) */}
        {record.entrada_hora && record.saida_hora && (
          <div className="bg-gray-50/50 rounded-xl p-2.5 flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-700">{record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}</span>
            </div>
            {record.saldo_minutos !== undefined && record.saldo_minutos !== null && (
              <span className={cn(
                "text-[10px] font-black",
                record.saldo_minutos >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {formatMinutes(record.saldo_minutos, true)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <MobileActionItem actions={actions} className="rounded-2xl overflow-hidden shadow-sm">
        {cardContent}
      </MobileActionItem>
    </div>
  );
};

interface TimeTrackingListProps {
  records: RegistroPonto[];
  date: Date;
}

export function TimeTrackingList({ records, date }: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { mutateAsync: deletePonto } = useDeletePonto();

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

  if (records.length === 0) {
    return (
      <UnifiedEmptyState
        icon={FilterX}
        title="Nenhum registro encontrado"
        description="Não há registros de ponto para os filtros selecionados nesta data."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <TimeRecordCard
          key={record.id}
          record={record}
          date={date}
          onDetails={openDetails}
          onEdit={(record) => openTimeRecordDialog({ record })}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

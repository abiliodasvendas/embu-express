import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { RegistroPonto } from "@/types/database";
import { calculateTotalTime, getStatusColorClass, getStatusLabel } from "@/utils/ponto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, Clock, Edit2, X } from "lucide-react";

interface TimeRecordDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistroPonto | null;
  onEdit: (record: RegistroPonto) => void;
  // onDelete removed as user requested Close interaction only
}

export function TimeRecordDetailsDialog({ isOpen, onClose, record, onEdit }: Omit<TimeRecordDetailsDialogProps, 'onDelete'> & { onDelete?: any }) {
  if (!record) return null;

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  const formatTime = (timeIso?: string | null) => {
    if (!timeIso) return "--:--";
    return format(new Date(timeIso), "HH:mm");
  };

  const handleClose = () => {
      safeCloseDialog(onClose);
  };

  const handleEdit = () => {
      safeCloseDialog(() => onEdit(record));
  };



  const renderCalculationDetails = (type: 'entrada' | 'saida') => {
      const details = record.detalhes_calculo?.[type];
      const timeIso = type === 'entrada' ? record.entrada_hora : record.saida_hora;
      const status = type === 'entrada' ? record.status_entrada : record.status_saida;

      if (!details || !timeIso) return (
        <p className="text-sm text-gray-400 italic">Sem detalhes de cálculo disponíveis.</p>
      );

      const diff = details.diff_minutos;
      const isLateOrExtra = diff > 0;
      const sign = isLateOrExtra ? "+" : "";

      const kmValue = type === 'entrada' ? record.entrada_km : record.saida_km;
      const kmDisplay = kmValue ? `${kmValue.toLocaleString('pt-BR')} km` : "Não se aplica";

      return (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
             {/* KM Display */}
             <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kilometragem:</span>
                <span className="font-medium text-gray-900">
                    {kmDisplay}
                </span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horário Registrado:</span>
                <span className="font-medium text-gray-900">{formatTime(timeIso)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Turno Esperado:</span>
                <span className="font-medium text-gray-900">{details.turno_base?.substring(0, 5) || '--:--'}</span>
            </div>
            <div className="border-t border-gray-200 my-1"></div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diferença:</span>
                <span className={`font-bold ${diff > 0 ? "text-red-600" : "text-green-600"}`}>
                    {sign}{diff} min
                </span>
            </div>
             <div className="mt-2 text-center">
                 <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColorClass(status)} font-medium`}>
                     {getStatusLabel(status, type)}
                 </span>
            </div>
        </div>
      );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-lg p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* Header - Style matched to van-control/EscolaFormDialog */}
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
            <CalendarClock className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Detalhes do Ponto
          </DialogTitle>
          <DialogDescription className="text-blue-100/90 text-sm mt-1">
            {formatDate(record.data_referencia)}
          </DialogDescription>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 bg-white flex-1 overflow-y-auto space-y-6">
            
            {/* Colaborador Info */}
            <div className="text-center pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{record.usuario?.nome_completo}</h3>
                <p className="text-sm text-gray-500">{record.usuario?.cliente?.nome_fantasia}</p>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Saldo</span>
                    <span className={`text-lg font-bold ${record.saldo_minutos !== undefined ? (record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500") : "text-gray-400"}`}>
                         {record.saldo_minutos !== undefined ? (record.saldo_minutos > 0 ? "+" : "") + record.saldo_minutos : "--"} min
                    </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Trabalhadas</span>
                    <span className="text-lg font-bold text-gray-700">
                        {calculateTotalTime(record.entrada_hora, record.saida_hora) || "--"}
                    </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Turno</span>
                    <span className="text-md sm:text-lg font-bold text-gray-700">
                         {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5) || "--"} 
                         {" - "}
                         {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5) || "--"}
                    </span>
                </div>
            </div>

            {/* Entry Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4" />
                    <h4 className="font-bold text-gray-800">Entrada</h4>
                </div>
                {renderCalculationDetails('entrada')}
            </div>

            {/* Exit Section */}
             <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4" />
                    <h4 className="font-bold text-gray-800">Saída</h4>
                </div>
                {renderCalculationDetails('saida')}
            </div>

            {/* Removed Saldo Section */ }
            
            {/* Observation if any */}
            {record.observacao && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                    <span className="font-bold block mb-1">Observação:</span>
                    {record.observacao}
                </div>
            )}
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
          >
            Fechar
          </Button>
          <Button
            onClick={handleEdit}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

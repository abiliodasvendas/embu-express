import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { RegistroPonto } from "@/types/database";
import { getStatusColorClass, getStatusLabel } from "@/utils/ponto";
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
             {/* KM Display Removed - Now in Summary Card */}
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
            {/* Summary Card Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3">
                {/* 1. Saldo */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Saldo</span>
                    <span className={`text-xl font-bold ${record.saldo_minutos !== undefined ? (record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500") : "text-gray-400"}`}>
                         {record.saldo_minutos !== undefined ? (record.saldo_minutos > 0 ? "+" : "") + record.saldo_minutos : "--"} min
                    </span>
                </div>

                {/* 2. Trabalhadas */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Trabalhadas</span>
                    <span className="text-lg font-bold text-gray-700">
                        {record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--"}
                    </span>
                </div>

                {/* 3. Quilometragem */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24 relative overflow-hidden">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5 z-10">Quilometragem</span>
                    <span className="text-xl font-bold text-blue-600 z-10">
                        {record.detalhes_calculo?.resumo?.diff_km !== undefined 
                            ? `${record.detalhes_calculo.resumo.diff_km > 0 ? "+" : ""}${record.detalhes_calculo.resumo.diff_km} km` 
                            : "--"}
                    </span>
                    
                    {/* Detailed KM Info */}
                    <div className="flex w-full justify-center gap-3 mt-1 text-[9px] text-gray-500 font-medium z-10 px-1">
                        <div className="flex flex-col leading-tight">
                            <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Entrada</span>
                            <span>{record.entrada_km || '-'}</span>
                        </div>
                         <div className="w-px bg-gray-200 h-full mx-1"></div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-gray-400 uppercase tracking-tighter text-[8px]">Saída</span>
                            <span>{record.saida_km || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Turno */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Turno</span>
                    <span className="text-md font-bold text-gray-700">
                         {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5) || "--"} - {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5) || "--"}
                    </span>
                </div>
            </div>

            {/* Entry/Exit Sections - Side-by-Side on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Entry Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Entrada</h4>
                    </div>
                    {renderCalculationDetails('entrada')}
                </div>

                {/* Exit Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                         <div className="p-1.5 bg-orange-50 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Saída</h4>
                    </div>
                    {renderCalculationDetails('saida')}
                </div>
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

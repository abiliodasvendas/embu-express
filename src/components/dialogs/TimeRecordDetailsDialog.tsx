import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinalizarPausa, useIniciarPausa } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { RegistroPonto } from "@/types/database";
import { getStatusColorClass, getStatusLabel } from "@/utils/ponto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, Clock, Edit2, Loader2, Pause, Play, X } from "lucide-react";
import { useState } from "react";

interface TimeRecordDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistroPonto | null;
  onEdit: (record: RegistroPonto) => void;
  onDelete?: any; 
}

export function TimeRecordDetailsDialog({ isOpen, onClose, record, onEdit }: TimeRecordDetailsDialogProps) {
  const { mutateAsync: iniciarPausa, isPending: isStarting } = useIniciarPausa();
  const { mutateAsync: finalizarPausa, isPending: isEnding } = useFinalizarPausa();

  const [pauseInputs, setPauseInputs] = useState({ km: "", loc: "" });
  const [showPauseForm, setShowPauseForm] = useState(false);

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
  
  // Pause Logic
  const pausas = (record as any).pausas || [];
  const openPause = pausas.find((p: any) => !p.fim_hora);
  const isShiftOpen = !!record.entrada_hora && !record.saida_hora;

  const handlePauseAction = async () => {
      try {
          if (openPause) {
              // Finish Pause
              await finalizarPausa({ 
                  pausaId: openPause.id, 
                  data: { 
                      fim_hora: new Date().toISOString(),
                      fim_km: pauseInputs.km ? Number(pauseInputs.km) : null,
                      fim_loc: pauseInputs.loc
                  } 
              });
          } else {
              // Start Pause
              await iniciarPausa({ 
                  pontoId: record.id, 
                  data: { 
                      inicio_hora: new Date().toISOString(),
                      inicio_km: pauseInputs.km ? Number(pauseInputs.km) : null,
                      inicio_loc: pauseInputs.loc
                  } 
              });
          }
          setPauseInputs({ km: "", loc: "" });
          setShowPauseForm(false);
      } catch (e) {
          console.error(e);
      }
  };

  const renderCalculationDetails = (type: 'entrada' | 'saida') => {
      const details = record.detalhes_calculo?.[type];
      const timeIso = type === 'entrada' ? record.entrada_hora : record.saida_hora;
      const status = type === 'entrada' ? record.status_entrada : record.status_saida;

      if (!details || !timeIso) return (
        <p className="text-sm text-gray-400 italic">Sem detalhes de cálculo disponíveis.</p>
      );

      const diff = details.diff_minutos;
      
      return (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
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
                    {diff > 0 ? "+" : ""}{diff} min
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

  const isActionPending = isStarting || isEnding;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-lg p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
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
        </div>

        <div className="p-6 bg-white flex-1 overflow-y-auto space-y-6">
            
            <div className="text-center pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{record.usuario?.nome_completo}</h3>
                <p className="text-sm text-gray-500">{record.usuario?.cliente?.nome_fantasia}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Saldo</span>
                    <span className={`text-xl font-bold ${record.saldo_minutos !== undefined ? (record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500") : "text-gray-400"}`}>
                         {record.saldo_minutos !== undefined ? (record.saldo_minutos > 0 ? "+" : "") + record.saldo_minutos : "--"} min
                    </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-24">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Trabalhadas</span>
                    <span className="text-lg font-bold text-gray-700">
                        {record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--"}
                    </span>
                </div>
            </div>

            {/* Pauses Section */}
            {isShiftOpen && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                         <h4 className="font-bold text-orange-900 flex items-center gap-2">
                             <Pause className="w-4 h-4" /> Pausas
                         </h4>
                         {!showPauseForm && (
                             <Button 
                                size="sm" 
                                variant={openPause ? "default" : "outline"}
                                className={openPause ? "bg-green-600 hover:bg-green-700 text-white" : "border-orange-200 text-orange-700 hover:bg-orange-100"}
                                onClick={() => setShowPauseForm(true)}
                             >
                                 {openPause ? <><Play className="w-3 h-3 mr-1"/> Retornar</> : <><Pause className="w-3 h-3 mr-1"/> Pausar</>}
                             </Button>
                         )}
                    </div>

                    {showPauseForm && (
                        <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                {openPause ? "Finalizar Pausa" : "Iniciar Pausa"}
                            </h5>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">KM Local</Label>
                                    <Input 
                                        className="h-8 text-xs" 
                                        type="number" 
                                        placeholder="0"
                                        value={pauseInputs.km}
                                        onChange={e => setPauseInputs({...pauseInputs, km: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Localização</Label>
                                    <Input 
                                        className="h-8 text-xs" 
                                        placeholder="Rua..."
                                        value={pauseInputs.loc}
                                        onChange={e => setPauseInputs({...pauseInputs, loc: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="flex-1 h-8 text-xs"
                                    onClick={() => setShowPauseForm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    size="sm" 
                                    className={`flex-1 h-8 text-xs text-white ${openPause ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}
                                    onClick={handlePauseAction}
                                    disabled={isActionPending}
                                >
                                    {isActionPending ? <Loader2 className="w-3 h-3 animate-spin"/> : "Confirmar"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {pausas.length > 0 ? (
                        <div className="space-y-2 mt-3">
                            {pausas.map((p: any, idx: number) => {
                                const start = new Date(p.inicio_hora);
                                const end = p.fim_hora ? new Date(p.fim_hora) : null;
                                const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

                                return (
                                    <div key={p.id} className="text-xs bg-white/60 p-2 rounded border border-orange-100 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-orange-900">Pausa #{idx + 1}</span>
                                            <span className="text-gray-500">
                                                {format(start, "HH:mm")} - {end ? format(end, "HH:mm") : "Em andamento..."}
                                            </span>
                                        </div>
                                        {duration !== null && (
                                            <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {duration} min
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-center text-orange-400 italic mt-2">Nenhuma pausa registrada.</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Entrada</h4>
                    </div>
                    {renderCalculationDetails('entrada')}
                </div>

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

            {record.observacao && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                    <span className="font-bold block mb-1">Observação:</span>
                    {record.observacao}
                </div>
            )}
        </div>

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

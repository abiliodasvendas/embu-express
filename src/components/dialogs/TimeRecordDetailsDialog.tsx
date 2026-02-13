import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinalizarPausa, useIniciarPausa } from "@/hooks/api/usePontoMutations";
import { cn } from "@/lib/utils";
import { RegistroPonto } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getStatusColorClass, getStatusLabel } from "@/utils/ponto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, CalendarClock, Clock, Edit2, Loader2, MapPin, Pause, Play, User, X } from "lucide-react";
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
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center h-full min-h-[140px]">
            <p className="text-xs text-gray-400 italic text-center">Aguardando registro para calcular...</p>
        </div>
      );

      const diff = details.diff_minutos;
      
      return (
        <div className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100 shadow-sm transition-all hover:border-blue-100">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Registrado</span>
                <span className="font-bold text-gray-900 font-mono text-base">{formatTime(timeIso)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Turno Base</span>
                <span className="font-medium text-gray-700 font-mono">{details.turno_base?.substring(0, 5) || '--:--'}</span>
            </div>
            <div className="border-t border-gray-50 my-1"></div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Diferença</span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${diff > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                    {diff > 0 ? "+" : ""}{diff} min
                </span>
            </div>
             <div className="pt-2 text-center">
                 <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-bold ${getStatusColorClass(status)}`}>
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
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <CalendarClock className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Detalhes do Ponto
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                    <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{record.usuario?.nome_completo}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{record.usuario?.cliente?.nome_fantasia}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{formatDate(record.data_referencia)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-28 transition-all hover:bg-gray-50">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Saldo Diário</span>
                    <span className={`text-2xl font-black ${record.saldo_minutos !== undefined ? (record.saldo_minutos >= 0 ? "text-green-600" : "text-red-500") : "text-gray-300"}`}>
                         {record.saldo_minutos !== undefined ? (record.saldo_minutos > 0 ? "+" : "") + record.saldo_minutos : "--"} <span className="text-xs">min</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-28 transition-all hover:bg-gray-50">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Trabalhadas</span>
                    <span className="text-2xl font-black text-gray-700 font-mono">
                        {record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--"}
                    </span>
                </div>
            </div>

            {/* Pauses Section */}
            {isShiftOpen && (
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 space-y-4">
                    <div className="flex items-center justify-between">
                         <h4 className="font-bold text-orange-900 flex items-center gap-2">
                             <div className="p-1.5 bg-orange-100 rounded-lg">
                                <Pause className="w-4 h-4 text-orange-600" />
                             </div>
                             Pausas
                         </h4>
                         {!showPauseForm && (
                             <Button 
                                size="sm" 
                                variant={openPause ? "default" : "outline"}
                                className={cn(
                                    "rounded-xl h-9 px-4 font-bold transition-all",
                                    openPause ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20" : "border-orange-200 text-orange-700 hover:bg-orange-100"
                                )}
                                onClick={() => setShowPauseForm(true)}
                             >
                                 {openPause ? <><Play className="w-4 h-4 mr-1.5"/> Retornar</> : <><Pause className="w-4 h-4 mr-1.5"/> Iniciar Pausa</>}
                             </Button>
                         )}
                    </div>

                    {showPauseForm && (
                        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm animate-in fade-in zoom-in-95 duration-200 space-y-4">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {openPause ? "Finalizar Pausa" : "Novo Registro de Pausa"}
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-gray-500">KM Atual</Label>
                                    <Input 
                                        className="h-10 text-sm rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-none" 
                                        type="number" 
                                        placeholder="Km"
                                        value={pauseInputs.km}
                                        onChange={e => setPauseInputs({...pauseInputs, km: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-gray-500">Localização</Label>
                                    <Input 
                                        className="h-10 text-sm rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-none" 
                                        placeholder="Onde?"
                                        value={pauseInputs.loc}
                                        onChange={e => setPauseInputs({...pauseInputs, loc: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="flex-1 h-10 rounded-xl"
                                    onClick={() => setShowPauseForm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    size="sm" 
                                    className={cn(
                                        "flex-1 h-10 rounded-xl text-white font-bold shadow-lg transition-all",
                                        openPause ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                    )}
                                    onClick={handlePauseAction}
                                    disabled={isActionPending}
                                >
                                    {isActionPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirmar"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {pausas.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {pausas.map((p: any, idx: number) => {
                                const start = new Date(p.inicio_hora);
                                const end = p.fim_hora ? new Date(p.fim_hora) : null;
                                const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

                                return (
                                    <div key={p.id} className="text-xs bg-white p-3 rounded-xl border border-orange-100 flex justify-between items-center shadow-sm">
                                        <div className="flex gap-3 items-center">
                                            <div className="bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-orange-600">
                                                {idx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-800 uppercase tracking-tighter text-[10px]">Período</span>
                                                <span className="text-gray-500 font-mono text-sm">
                                                    {format(start, "HH:mm")} - {end ? format(end, "HH:mm") : "Andamento..."}
                                                </span>
                                            </div>
                                        </div>
                                        {duration !== null && (
                                            <div className="text-right">
                                                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-[10px] uppercase">
                                                    {duration} min
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-4 text-center border-2 border-dashed border-orange-200 rounded-2xl">
                            <p className="text-xs text-orange-400 font-medium italic">Nenhuma pausa registrada neste turno.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pl-1">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Entrada</h4>
                    </div>
                    {renderCalculationDetails('entrada')}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 pl-1">
                         <div className="p-1.5 bg-orange-50 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest">Saída</h4>
                    </div>
                    {renderCalculationDetails('saida')}
                </div>
            </div>

            {record.observacao && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-sm text-amber-900 animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-black text-[10px] uppercase tracking-widest block mb-2 text-amber-600">Observações</span>
                    <p className="leading-relaxed font-medium">{record.observacao}</p>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-white font-medium"
          >
            Fechar
          </Button>
          <Button
            onClick={handleEdit}
            className="w-full h-11 rounded-xl font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

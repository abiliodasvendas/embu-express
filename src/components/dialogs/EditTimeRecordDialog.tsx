import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePonto } from "@/hooks/api/usePontoMutations";
import { EditTimeRecordFormValues, editTimeRecordSchema } from "@/schemas/pontoSchema";
import { RegistroPonto } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { TimeRules } from "@/utils/timeRules";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Building2, Clock, Edit2, Loader2, Save, User, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditTimeRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistroPonto | null;
}


export function EditTimeRecordDialog({ isOpen, onClose, record }: EditTimeRecordDialogProps) {
  const updatePonto = useUpdatePonto();
  
  const form = useForm<EditTimeRecordFormValues>({
    resolver: zodResolver(editTimeRecordSchema),
    defaultValues: {
      entrada_hora: "",
      saida_hora: "",
    },
  });

  useEffect(() => {
    if (record && isOpen) {
      form.reset({
        entrada_hora: record.entrada_hora ? format(new Date(record.entrada_hora), "HH:mm") : "",
        saida_hora: record.saida_hora ? format(new Date(record.saida_hora), "HH:mm") : "",
      });
    }
  }, [record, isOpen, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const onSubmit = (values: EditTimeRecordFormValues) => {
    if (!record) return;

    const baseDate = record.entrada_hora ? format(new Date(record.entrada_hora), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const { entrada, saida } = TimeRules.resolveDates(baseDate, values.entrada_hora, values.saida_hora || undefined);

    if (saida) {
        const checkMax = TimeRules.validateMaxDuration(entrada, saida, 16);
        if (!checkMax.valid) {
            toast.error("Erro na validação", { description: checkMax.message });
            return;
        }
    }

    updatePonto.mutate(
      {
        id: record.id,
        data: {
          entrada_hora: entrada.toISOString(),
          saida_hora: saida ? saida.toISOString() : null, 
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-sm p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Edit2 className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Editar Registro
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30 space-y-5">
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
                <div className="mx-auto w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{record.usuario?.nome_completo}</h3>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Building2 className="w-3 h-3" />
                    <span>{record.usuario?.cliente?.nome_fantasia}</span>
                </div>
           </div>

           <form id="edit-ponto-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entrada" className="text-gray-700 font-bold">Entrada <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="entrada"
                            type="time"
                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-mono"
                            {...form.register("entrada_hora")}
                        />
                    </div>
                    {form.formState.errors.entrada_hora && (
                      <span className="text-[10px] text-red-500 block font-bold mt-1 uppercase">{form.formState.errors.entrada_hora.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saida" className="text-gray-700 font-bold">Saída</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="saida"
                            type="time"
                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-mono"
                            {...form.register("saida_hora")}
                        />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-700 text-center font-medium animate-in fade-in slide-in-from-top-1">
                    <span className="font-black uppercase tracking-widest block mb-0.5">Recálculo Automático</span>
                    Os status e o saldo de horas serão atualizados após salvar.
                </div>
           </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-white font-medium"
            >
              Cancelar
            </Button>
            <Button 
                type="submit" 
                form="edit-ponto-form"
                disabled={updatePonto.isPending}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              {updatePonto.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
              ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </>
              )}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

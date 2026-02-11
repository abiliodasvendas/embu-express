import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePonto } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { EditTimeRecordFormValues, editTimeRecordSchema } from "@/schemas/pontoSchema";
import { RegistroPonto } from "@/types/database";
import { TimeRules } from "@/utils/timeRules";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit2, Loader2, Save, X } from "lucide-react";
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

    // Use o utilitário compartilhado para consistência de regras
    const baseDate = record.entrada_hora ? format(new Date(record.entrada_hora), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const { entrada, saida } = TimeRules.resolveDates(baseDate, values.entrada_hora, values.saida_hora || undefined);

    // Validação de segurança
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

  // Helper inside component or utilize date-fns directly
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* Header - Style matched to TimeRecordDetailsDialog */}
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
            <Edit2 className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Editar Registro
          </DialogTitle>
        </div>

        {/* Scrollable Body - Form */}
        <div className="p-6 bg-white flex-1 overflow-y-auto space-y-6">
           <form id="edit-ponto-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="text-center pb-2 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{record.usuario?.nome_completo}</h3>
                <p className="text-sm text-gray-500">{record.usuario?.cliente?.nome_fantasia}</p>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="entrada" className="text-gray-700">
                         Entrada <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="entrada"
                      type="time"
                      className="h-10 bg-white"
                      {...form.register("entrada_hora")}
                    />
                    {form.formState.errors.entrada_hora && (
                      <span className="text-xs text-red-500 block">{form.formState.errors.entrada_hora.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="saida" className="text-gray-700">
                         Saída
                    </Label>
                    <Input
                      id="saida"
                      type="time"
                      className="h-10 bg-white"
                      {...form.register("saida_hora")}
                    />
                  </div>
               </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700 text-center">
                    <span className="font-semibold block mb-0.5">Nota:</span>
                    Os status e o saldo de horas serão recalculados automaticamente após salvar.
                </div>
           </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
            >
              Cancelar
            </Button>
            <Button 
                type="submit" 
                form="edit-ponto-form"
                disabled={updatePonto.isPending}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
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

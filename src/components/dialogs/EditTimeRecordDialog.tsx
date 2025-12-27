import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePonto } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { RegistroPonto } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Edit2, Loader2, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditTimeRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistroPonto | null;
}

const editRecordSchema = z.object({
  entrada_hora: z.string().min(1, "Horário de entrada obrigatório"),
  saida_hora: z.string().optional(),
});

type EditRecordForm = z.infer<typeof editRecordSchema>;

export function EditTimeRecordDialog({ isOpen, onClose, record }: EditTimeRecordDialogProps) {
  const updatePonto = useUpdatePonto();
  
  const form = useForm<EditRecordForm>({
    resolver: zodResolver(editRecordSchema),
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

  const onSubmit = (values: EditRecordForm) => {
    if (!record) return;

    // Construct full ISO strings based on the original record's date
    const baseDate = record.entrada_hora ? new Date(record.entrada_hora) : new Date(); // Fallback
    const dateString = format(baseDate, "yyyy-MM-dd");

    const entradaISO = `${dateString}T${values.entrada_hora}:00`;
    const saidaISO = values.saida_hora ? `${dateString}T${values.saida_hora}:00` : null;

    updatePonto.mutate(
      {
        id: record.id,
        data: {
          entrada_hora: entradaISO,
          saida_hora: saidaISO || null, // Ensure explicit null if empty
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
          <DialogDescription className="text-blue-100/90 text-sm mt-1">
             {record.data_referencia ? formatDate(record.data_referencia) : "Ajuste os horários"}
          </DialogDescription>
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
                    <Label htmlFor="entrada" className="flex items-center gap-1.5 text-gray-700">
                         <Clock className="w-4 h-4 text-blue-600" /> Entrada
                    </Label>
                    <Input
                      id="entrada"
                      type="time"
                      className="h-12 text-lg font-semibold text-center bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500"
                      {...form.register("entrada_hora")}
                    />
                    {form.formState.errors.entrada_hora && (
                      <span className="text-xs text-red-500 block">{form.formState.errors.entrada_hora.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="saida" className="flex items-center gap-1.5 text-gray-700">
                         <Clock className="w-4 h-4 text-orange-600" /> Saída
                    </Label>
                    <Input
                      id="saida"
                      type="time"
                      className="h-12 text-lg font-semibold text-center bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500"
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

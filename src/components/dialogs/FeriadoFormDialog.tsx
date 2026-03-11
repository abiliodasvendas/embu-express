import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messages } from "@/constants/messages";
import { useCreateFeriado, useUpdateFeriado } from "@/hooks";
import { cn } from "@/lib/utils";
import { Feriado } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FeriadoFormValues, feriadoSchema } from "@/schemas/feriadoSchema";

interface FeriadoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feriadoToEdit?: Feriado;
}

export function FeriadoFormDialog({
  open,
  onOpenChange,
  feriadoToEdit,
}: FeriadoFormDialogProps) {
  const createFeriado = useCreateFeriado();
  const updateFeriado = useUpdateFeriado();

  const isEditing = !!feriadoToEdit;
  const isLoading = createFeriado.isPending || updateFeriado.isPending;

  const form = useForm<FeriadoFormValues>({
    resolver: zodResolver(feriadoSchema),
    defaultValues: {
      data: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (feriadoToEdit) {
        form.reset({
          data: feriadoToEdit.data,
          descricao: feriadoToEdit.descricao,
        });
      } else {
        form.reset({
          data: "",
          descricao: "",
        });
      }
    }
  }, [open, feriadoToEdit, form]);

  const onSubmit = async (values: FeriadoFormValues) => {
    try {
      const feriadoData = {
        data: values.data,
        descricao: values.descricao
      };

      if (isEditing && feriadoToEdit) {
        await updateFeriado.mutateAsync({ 
          id: feriadoToEdit.id, 
          ...feriadoData
        });
      } else {
        await createFeriado.mutateAsync(feriadoData);
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar feriado:", error);
      toast.error(isEditing ? messages.feriado.erro.atualizar : messages.feriado.erro.criar, {
        description: error.message
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent className="w-full max-w-md p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Editar Feriado" : "Novo Feriado"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
          <Form {...form}>
            <form id="feriado-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Data <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          className={cn(
                            "pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all shadow-sm",
                            form.formState.errors.data && "border-red-500 focus-visible:ring-red-200"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Descrição <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Ex: Natal"
                          className={cn(
                            "pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all shadow-sm",
                            form.formState.errors.descricao && "border-red-500 focus-visible:ring-red-200"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="feriado-form"
            disabled={isLoading}
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
              "Salvar Alterações"
            ) : (
              "Criar Feriado"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

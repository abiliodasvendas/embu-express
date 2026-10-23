import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
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
import { Calendar, FileText, Loader2 } from "lucide-react";
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
      if (isEditing && feriadoToEdit) {
        await updateFeriado.mutateAsync({
          id: feriadoToEdit.id,
          ...values,
        });
      } else {
        await createFeriado.mutateAsync(values);
      }
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(isEditing ? messages.feriado.erro.atualizar : messages.feriado.erro.criar, {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Calendar className="h-5 w-5" />}
        title={isEditing ? "Editar Feriado" : "Novo Feriado"}
        subtitle={
          isEditing
            ? "Atualize as informações do feriado cadastrado"
            : "Preencha a data e descrição para cadastrar um novo feriado"
        }
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="py-5 px-6">
        <Form {...form}>
          <form id="feriado-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Data <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.data && "border-destructive focus-visible:ring-destructive/20"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Descrição <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Confraternização Universal"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.descricao && "border-destructive focus-visible:ring-destructive/20"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={isLoading}
        />
        <BaseDialog.Action
          label={isEditing ? "Salvar Alterações" : "Criar Feriado"}
          variant="primary"
          type="submit"
          form="feriado-form"
          isLoading={isLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

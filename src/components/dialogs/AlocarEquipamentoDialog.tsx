import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/constants/messages";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import {
  useAssociarItens,
  useItensQuery,
} from "@/hooks/api/useItensEquipamentos";
import { cn } from "@/lib/utils";
import { associarItemSchema } from "@/schemas/itensEquipamentosSchema";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Package } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface AlocarEquipamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradorId?: string;
}

type AlocacaoFormValues = z.infer<typeof associarItemSchema>;

export function AlocarEquipamentoDialog({
  open,
  onOpenChange,
  colaboradorId,
}: AlocarEquipamentoDialogProps) {
  const { data: colaboradoresResponse } = useCollaborators({});
  const colaboradores = useMemo(() => {
    if (!colaboradoresResponse) return [];
    if (Array.isArray(colaboradoresResponse)) return colaboradoresResponse;
    return colaboradoresResponse.data || [];
  }, [colaboradoresResponse]);

  const { data: itens = [] } = useItensQuery();
  const associarMutation = useAssociarItens();

  const form = useForm<AlocacaoFormValues>({
    resolver: zodResolver(associarItemSchema),
    defaultValues: {
      colaborador_id: colaboradorId || "",
      itens_ids: [],
      observacao: "",
    },
  });

  const selectedItensIds = form.watch("itens_ids") || [];

  useEffect(() => {
    if (open) {
      form.reset({
        colaborador_id: colaboradorId || "",
        itens_ids: [],
        observacao: "",
      });
    }
  }, [open, form, colaboradorId]);

  const onSubmit = async (values: AlocacaoFormValues) => {
    try {
      await associarMutation.mutateAsync({
        colaborador_id: values.colaborador_id,
        itens_ids: values.itens_ids,
        observacao: values.observacao || null,
      });
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(messages.itemEquipamento.erro.alocar, {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleCheckboxChange = (itemId: number, checked: boolean) => {
    const current = form.getValues("itens_ids") || [];
    if (checked) {
      form.setValue("itens_ids", [...current, itemId], { shouldValidate: true });
    } else {
      form.setValue(
        "itens_ids",
        current.filter((id) => id !== itemId),
        { shouldValidate: true }
      );
    }
  };

  const activeItens = itens.filter((i) => i.ativo);

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="lg"
    >
      <BaseDialog.Header
        icon={<Package className="h-5 w-5" />}
        title="Alocar Equipamentos"
        subtitle="Associe itens e equipamentos a um colaborador do sistema"
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-6 space-y-5">
        <Form {...form}>
          <form id="alocar-equipamento-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="colaborador_id"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Colaborador <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      modal={true}
                      options={colaboradores.map((c) => ({
                        value: c.id,
                        label: c.nome_completo,
                      }))}
                      value={field.value}
                      onSelect={field.onChange}
                      placeholder="Selecione um colaborador..."
                      searchPlaceholder="Buscar colaborador..."
                      emptyText="Nenhum colaborador encontrado."
                      disabled={!!colaboradorId}
                      className={cn(
                        "h-11 rounded-[16px] bg-background border-border text-xs font-medium focus-visible:ring-primary/20",
                        form.formState.errors.colaborador_id && "border-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itens_ids"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Selecione os Itens <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    {activeItens.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {activeItens.map((item) => {
                          const isChecked = selectedItensIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleCheckboxChange(item.id, !isChecked)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] select-none",
                                isChecked
                                  ? "border-primary bg-primary/[0.06] shadow-xs"
                                  : "border-border bg-card hover:bg-surface-alt"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all shrink-0",
                                  isChecked
                                    ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                    : "bg-background border-border text-transparent"
                                )}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-foreground text-xs truncate leading-snug">
                                  {item.nome}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                                  {item.categoria?.nome || "Sem Categoria"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-border rounded-2xl bg-card">
                        <Package className="w-6 h-6 text-muted-foreground/60 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-muted-foreground">Nenhum item ativo no catálogo</p>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Observação
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Observações sobre a alocação (opcional)..."
                      className="min-h-[80px] rounded-[16px] bg-background border-border text-xs font-medium resize-none focus-visible:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={associarMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="alocar-equipamento-form"
          disabled={associarMutation.isPending || activeItens.length === 0}
        >
          {associarMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Alocando...</span>
            </>
          ) : (
            <span>Alocar Itens</span>
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

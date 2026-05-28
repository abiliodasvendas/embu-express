import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { messages } from "@/constants/messages";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import {
  useItensQuery,
  useAssociarItens,
} from "@/hooks/api/useItensEquipamentos";
import { cn } from "@/lib/utils";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Users, Loader2, X, FileText, Check } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { associarItemSchema } from "@/schemas/itensEquipamentosSchema";

interface AlocarEquipamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AlocacaoFormValues = z.infer<typeof associarItemSchema>;

export function AlocarEquipamentoDialog({
  open,
  onOpenChange,
}: AlocarEquipamentoDialogProps) {
  const { data: colaboradores = [] } = useCollaborators({});
  const { data: itens = [] } = useItensQuery();
  const associarMutation = useAssociarItens();

  const form = useForm<AlocacaoFormValues>({
    resolver: zodResolver(associarItemSchema),
    defaultValues: {
      colaborador_id: "",
      itens_ids: [],
      observacao: "",
    },
  });

  const selectedItensIds = form.watch("itens_ids") || [];

  useEffect(() => {
    if (open) {
      form.reset({
        colaborador_id: "",
        itens_ids: [],
        observacao: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: AlocacaoFormValues) => {
    try {
      await associarMutation.mutateAsync({
        colaborador_id: values.colaborador_id,
        itens_ids: values.itens_ids,
        observacao: values.observacao || null,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(messages.itemEquipamento.erro.alocar, {
        description: error.response?.data?.message || error.message,
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
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Alocar Equipamento
          </DialogTitle>
          <p className="text-xs text-white/70 mt-1">Associe equipamentos a um colaborador do sistema</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form id="alocar-equipamento-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <FormField
                  control={form.control}
                  name="colaborador_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Colaborador <span className="text-red-500">*</span>
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
                          placeholder="Selecione um colaborador"
                          searchPlaceholder="Buscar colaborador..."
                          emptyText="Nenhum colaborador encontrado."
                          className={cn(
                            "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus-visible:ring-primary/20",
                            form.formState.errors.colaborador_id && "border-red-500 focus:ring-red-200"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <FormField
                  control={form.control}
                  name="itens_ids"
                  render={() => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Selecione os Itens <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        {activeItens.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                            {activeItens.map((item) => {
                              const isChecked = selectedItensIds.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleCheckboxChange(item.id, !isChecked)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border border-gray-100/80 bg-gray-50/30 hover:bg-slate-50 cursor-pointer transition-colors active:scale-[0.99] select-none",
                                    isChecked && "border-blue-200 bg-blue-50/10 hover:bg-blue-50/20"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                    isChecked 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20" 
                                      : "bg-white border-gray-300 text-transparent"
                                  )}>
                                    <Check className="w-3.5 h-3.5 stroke-[3.5px]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-gray-800 text-xs truncate leading-none">
                                      {item.nome}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase">
                                      {item.categoria?.nome || "Sem Categoria"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                            <Package className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                            <p className="text-xs font-semibold text-gray-500">Nenhum item ativo no catálogo</p>
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 pt-2">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Observação
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Ex: Entregue jaqueta tamanho G e capacete azul novos..."
                          className={cn(
                            "min-h-[80px] rounded-2xl bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none p-4 text-xs font-medium"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={associarMutation.isPending}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="alocar-equipamento-form"
            disabled={associarMutation.isPending || activeItens.length === 0}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {associarMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alocando...
              </>
            ) : (
              "Alocar Equipamentos"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

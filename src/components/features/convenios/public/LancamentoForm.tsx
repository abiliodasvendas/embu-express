import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { MoneyInput } from "@/components/ui/MoneyInput";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePublicLancamento,
  useUpdatePublicLancamento,
  usePublicCollaborators,
  useCreateAdminLancamento,
  useUpdateAdminLancamento,
} from "@/hooks/api/useConvenios";
import { useActiveCollaborators } from "@/hooks/api/useCollaborators";
import { cn } from "@/lib/utils";
import { LancamentoConvenio } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Receipt, X, Calendar } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  LancamentoConvenioFormValues,
  lancamentoConvenioSchema,
} from "@/schemas/convenioSchema";

interface LancamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token?: string;
  convenioId?: string;
  lancamentoToEdit?: LancamentoConvenio | null;
}

export function LancamentoForm({
  open,
  onOpenChange,
  token,
  convenioId,
  lancamentoToEdit,
}: LancamentoFormProps) {
  const createPublicLancamento = useCreatePublicLancamento();
  const updatePublicLancamento = useUpdatePublicLancamento();
  const createAdminLancamento = useCreateAdminLancamento();
  const updateAdminLancamento = useUpdateAdminLancamento();

  const { data: publicCollaborators = [] } = usePublicCollaborators(token || "");
  const { data: adminCollaborators = [] } = useActiveCollaborators({ enabled: !!convenioId && open });

  const collaborators = convenioId ? adminCollaborators : publicCollaborators;

  const isEditing = !!lancamentoToEdit;
  const isLoading =
    createPublicLancamento.isPending ||
    updatePublicLancamento.isPending ||
    createAdminLancamento.isPending ||
    updateAdminLancamento.isPending;

  const form = useForm<LancamentoConvenioFormValues>({
    resolver: zodResolver(lancamentoConvenioSchema),
    defaultValues: {
      colaborador_id: "",
      data_lancamento: new Date().toISOString().substring(0, 10),
      valor: 0,
      descricao: "",
      moto_embu: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (lancamentoToEdit) {
        form.reset({
          colaborador_id: lancamentoToEdit.colaborador_id || "",
          data_lancamento: lancamentoToEdit.data_lancamento.substring(0, 10),
          valor: Number(lancamentoToEdit.valor),
          descricao: lancamentoToEdit.descricao || "",
          moto_embu: lancamentoToEdit.moto_embu,
        });
      } else {
        form.reset({
          colaborador_id: "",
          data_lancamento: new Date().toISOString().substring(0, 10),
          valor: 0,
          descricao: "",
          moto_embu: false,
        });
      }
    }
  }, [open, lancamentoToEdit, form]);

  const onSubmit = async (values: LancamentoConvenioFormValues) => {
    try {
      const payload = {
        colaborador_id: values.colaborador_id,
        data_lancamento: values.data_lancamento,
        valor: values.valor,
        descricao: values.descricao || null,
        moto_embu: values.moto_embu,
      };

      if (convenioId) {
        if (isEditing && lancamentoToEdit) {
          await updateAdminLancamento.mutateAsync({
            convenioId,
            id: lancamentoToEdit.id,
            payload,
          });
          toast.success("Lançamento atualizado com sucesso!");
        } else {
          await createAdminLancamento.mutateAsync({ convenioId, payload });
          toast.success("Lançamento efetuado com sucesso!");
        }
      } else if (token) {
        if (isEditing && lancamentoToEdit) {
          await updatePublicLancamento.mutateAsync({
            token,
            id: lancamentoToEdit.id,
            payload,
          });
          toast.success("Lançamento atualizado com sucesso!");
        } else {
          await createPublicLancamento.mutateAsync({ token, payload });
          toast.success("Lançamento efetuado com sucesso!");
        }
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || "";
      toast.error(
        isEditing ? "Erro ao atualizar lançamento" : "Erro ao criar lançamento",
        {
          description: message,
        }
      );
    }
  };

  const collaboratorOptions = collaborators.map((c) => ({
    value: c.id,
    label: c.nome_completo,
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
    >
      <DialogContent
        className="w-full max-w-md p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[95vh] bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-5 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm shadow-inner">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
          <p className="text-blue-100 text-xs mt-0.5 opacity-80">
            {isEditing
              ? "Modifique os dados do lançamento de manutenção"
              : "Registre uma nova despesa de manutenção"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 bg-white space-y-4">
          <Form {...form}>
            <form
              id="lancamento-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="moto_embu"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
                    <div className="space-y-0.5 pr-2">
                      <FormLabel className="text-gray-700 font-bold text-sm">
                        Veículo da Embu Express?
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Ative se for moto da frota própria da empresa.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colaborador_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-700 font-bold text-sm">
                      Colaborador <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={collaboratorOptions}
                        value={field.value || ""}
                        onSelect={field.onChange}
                        placeholder="Pesquisar..."
                        searchPlaceholder="Buscar por nome..."
                        emptyText="Nenhum colaborador ativo."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data_lancamento"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-gray-700 font-bold text-sm">
                        Data <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="date"
                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500/20 transition-all text-gray-900 shadow-none font-normal text-sm"
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
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-gray-700 font-bold text-sm">
                        Valor total (R$) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500/20 transition-all text-gray-900 shadow-none font-normal text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-700 font-bold text-sm">
                      Descrição dos serviços / peças <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Troca de óleo, pastilhas de freio traseiras, relação..."
                        className="rounded-xl min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus-visible:ring-blue-500/20 transition-all text-gray-700 shadow-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="lancamento-form"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

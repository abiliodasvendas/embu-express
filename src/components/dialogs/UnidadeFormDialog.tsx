import { CepInput } from "@/components/forms";
import { WeeklyScaleSelection } from "@/components/common/WeeklyScaleSelection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { messages } from "@/constants/messages";
import { useCreateUnidade, useUpdateUnidade } from "@/hooks/api/useUnidadeMutations";
import { cn } from "@/lib/utils";
import { Unidade } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cnpjMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { UnidadeFormData, unidadeSchema } from "@/schemas/unidadeSchema";
import { mockGenerator } from "@/utils/mocks/generator";

interface UnidadeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  editingUnidade?: Unidade | null;
  onSuccess?: () => void;
}

export function UnidadeFormDialog({
  isOpen,
  onClose,
  clienteId,
  editingUnidade = null,
  onSuccess,
}: UnidadeFormDialogProps) {
  const [isCepLoading, setIsCepLoading] = useState(false);

  const createUnidade = useCreateUnidade();
  const updateUnidade = useUpdateUnidade();

  const form = useForm<UnidadeFormData>({
    resolver: zodResolver(unidadeSchema),
    defaultValues: {
      cliente_id: clienteId,
      nome_unidade: "",
      razao_social: "",
      cnpj: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      km_contratados: 0,
      escala_semanal: [],
      ativo: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingUnidade) {
        form.reset({
          cliente_id: editingUnidade.cliente_id,
          nome_unidade: editingUnidade.nome_unidade,
          razao_social: editingUnidade.razao_social,
          cnpj: cnpjMask(editingUnidade.cnpj),
          cep: editingUnidade.cep,
          logradouro: editingUnidade.logradouro,
          numero: editingUnidade.numero,
          complemento: editingUnidade.complemento || "",
          bairro: editingUnidade.bairro,
          cidade: editingUnidade.cidade,
          estado: editingUnidade.estado,
          km_contratados: editingUnidade.km_contratados,
          escala_semanal: editingUnidade.escala_semanal,
          ativo: editingUnidade.ativo,
        });
      } else {
        form.reset({
          cliente_id: clienteId,
          nome_unidade: "",
          razao_social: "",
          cnpj: "",
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          km_contratados: 0,
          escala_semanal: [],
          ativo: true,
        });
      }
    }
  }, [isOpen, editingUnidade, clienteId, form]);

  const onFormError = (errors: FieldErrors<UnidadeFormData>) => {
    console.error("Erros de validação:", errors);
    toast.error(messages.validacao.formularioComErros);
  };

  const handleFillMagic = () => {
    const data = mockGenerator.unidade(clienteId);
    form.reset({
      ...data,
      cnpj: cnpjMask(data.cnpj),
    });
  };

  const onSubmit = async (values: UnidadeFormData) => {
    try {
      if (editingUnidade) {
        await updateUnidade.mutateAsync({
          id: editingUnidade.id,
          ...values,
        });
      } else {
        await createUnidade.mutateAsync({
          ...values,
          cliente_id: clienteId
        });
      }
      safeCloseDialog(() => onClose());
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar unidade:", error);
      const errorMessage = error.response?.data?.error || error.message || "";
      toast.error(errorMessage || "Erro ao salvar unidade");
    }
  };

  const isPending = createUnidade.isPending || updateUnidade.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent
        className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          {import.meta.env.DEV && (
            <div className="absolute left-4 top-4 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
                onClick={handleFillMagic}
                title="Preencher com dados mágicos"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>
          )}

          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {editingUnidade ? "Editar Unidade" : "Nova Unidade"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form id="unidade-form"
              onSubmit={form.handleSubmit(onSubmit, onFormError)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <FormField
                  control={form.control}
                  name="nome_unidade"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Nome da Unidade / Filial <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Ex: Matriz, Filial 1, Galpão A"
                            className={cn(
                              "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                              form.formState.errors.nome_unidade && "border-red-500 focus-visible:ring-red-200"
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
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Razão Social <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Nome de registro fiscal"
                            className={cn(
                              "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                              form.formState.errors.razao_social && "border-red-500 focus-visible:ring-red-200"
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
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        CNPJ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="00.000.000/0000-00"
                            className={cn(
                              "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                              form.formState.errors.cnpj && "border-red-500 focus-visible:ring-red-200"
                            )}
                            {...field}
                            onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Endereço da Unidade
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <div className="md:col-span-2">
                        <CepInput
                          field={field}
                          required
                          inputClassName="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary transition-all"
                          onLoadingChange={setIsCepLoading}
                        />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          Logradouro <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl bg-gray-50"
                            disabled={isCepLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          Número <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="h-11 rounded-xl bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          Bairro <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl bg-gray-50" disabled={isCepLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          Cidade <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl bg-gray-50" disabled={isCepLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          UF <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl bg-gray-50" disabled={isCepLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <FormField
                  control={form.control}
                  name="km_contratados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        KM Contratados (Motoboy/Mês) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Zap className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-12 h-11 rounded-xl bg-gray-50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-2 px-4 bg-gray-50/50 mt-8">
                      <FormLabel className="text-gray-700 font-bold text-sm opacity-70">Unidade Ativa</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="escala_semanal"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-3">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Escala Semanal da Unidade <span className="text-red-500">*</span>
                      </FormLabel>
                      <WeeklyScaleSelection
                        value={field.value}
                        onChange={field.onChange}
                      />
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
            onClick={() => safeCloseDialog(() => onClose())}
            disabled={isPending}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="unidade-form"
            disabled={isPending}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Unidade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

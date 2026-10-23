import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Switch } from "@/components/ui/switch";
import { messages } from "@/constants/messages";
import { useCreateClient, useUpdateClient } from "@/hooks";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { cn } from "@/lib/utils";
import { ClientFormData, clientSchema } from "@/schemas/clientSchema";
import { Client } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Wand2, Receipt, Calendar } from "lucide-react";
import { useEffect } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  PERIODICIDADE_FATURAMENTO,
  PERIODICIDADE_FATURAMENTO_LABELS,
  TIPO_COBRANCA_CLIENTE,
} from "@/constants/financeiro.constants";

interface ClientFormDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  editingClient?: Client | null;
  onSuccess?: () => void;
  profile?: unknown;
  allowBatchCreation?: boolean;
}

export function ClientFormDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  editingClient = null,
  onSuccess,
}: ClientFormDialogProps) {
  const isDialogOpen = open ?? isOpen ?? false;
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    onClose();
  };

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const navigate = useNavigate();
  const { data: empresas = [] } = useEmpresas();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome_fantasia: "",
      ativo: true,
      empresa_emissora_padrao_id: null,
      tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
      periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
      dia_vencimento_padrao: 16,
      valor_contrato_mensal: 0,
      valor_base: 0,
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          ativo: editingClient.ativo,
          empresa_emissora_padrao_id: editingClient.empresa_emissora_padrao_id ?? null,
          tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
          periodicidade: (editingClient.periodicidade as ClientFormData["periodicidade"]) || PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: editingClient.dia_vencimento_padrao || 16,
          valor_contrato_mensal: editingClient.valor_contrato_mensal ?? editingClient.valor_base ?? 0,
          valor_base: editingClient.valor_contrato_mensal ?? editingClient.valor_base ?? 0,
        });
      } else {
        form.reset({
          nome_fantasia: "",
          ativo: true,
          empresa_emissora_padrao_id: null,
          tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
          periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: 16,
          valor_contrato_mensal: 0,
          valor_base: 0,
        });
      }
    }
  }, [isDialogOpen, editingClient, form]);

  const onFormError = (errors: FieldErrors<ClientFormData>) => {
    toast.error(messages.validacao.formularioComErros);
  };

  const handleFillMock = () => {
    const data = mockGenerator.client();
    form.reset({
      ...data,
      tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
      periodicidade: (data.periodicidade as "QUINZENAL" | "MENSAL") || PERIODICIDADE_FATURAMENTO.QUINZENAL,
      dia_vencimento_padrao: data.dia_vencimento_padrao || 16,
      valor_contrato_mensal: data.valor_contrato_mensal || 30000,
      valor_base: data.valor_base || 30000,
    });
  };

  const onSubmit = async (values: ClientFormData) => {
    try {
      const payload = {
        ...values,
        tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
        valor_contrato_mensal: values.valor_contrato_mensal || values.valor_base || 0,
        valor_base: values.valor_contrato_mensal || values.valor_base || 0,
      };

      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          ...payload,
          silent: true,
        });
        toast.success(messages.cliente.sucesso.atualizado);
      } else {
        const newClient = await createClient.mutateAsync({
          ...payload,
          silent: true,
        });
        toast.success(messages.cliente.sucesso.criado);
        if (newClient?.id) {
          navigate(`/clientes/${newClient.id}`);
        }
      }
      form.reset();
      safeCloseDialog(handleClose);
      onSuccess?.();
    } catch {
      toast.error(editingClient ? messages.cliente.erro.atualizar : messages.cliente.erro.criar);
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <BaseDialog
      open={isDialogOpen}
      onOpenChange={(val) => {
        if (!val) safeCloseDialog(handleClose);
      }}
      maxWidth="xl"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={<Building2 className="h-5 w-5 text-foreground" />}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        subtitle="Cadastre o cliente e defina suas regras contratuais de faturamento."
        onClose={() => safeCloseDialog(handleClose)}
        leftAction={
          process.env.NODE_ENV === "development" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillMock}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Mock
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body className="p-5 sm:p-6 space-y-5">
        <Form {...form}>
          <form
            id="client-form"
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="flex flex-col flex-1 min-h-0 space-y-4"
          >
            <FormField
              control={form.control}
              name="nome_fantasia"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nome Fantasia <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Logística ABC"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:border-primary shadow-xs",
                          form.formState.errors.nome_fantasia && "border-destructive focus-visible:ring-destructive/20"
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
              name="empresa_emissora_padrao_id"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Empresa Emissora Padrão
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:border-primary shadow-xs"
                    >
                      <option value="">Nenhuma (Selecionar no faturamento)</option>
                      {empresas.map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>
                          {emp.nome_fantasia || emp.razao_social} {emp.codigo ? `(${emp.codigo})` : ""}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <div className="bg-muted/30 border border-border rounded-[20px] p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-foreground" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Contrato & Faturamento Mensal
                </span>
              </div>

              <div className={cn("grid gap-3", form.watch("periodicidade") === PERIODICIDADE_FATURAMENTO.MENSAL ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
                <FormField
                  control={form.control}
                  name="periodicidade"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Periodicidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                        >
                          <option value={PERIODICIDADE_FATURAMENTO.QUINZENAL}>
                            Quinzenal
                          </option>
                          <option value={PERIODICIDADE_FATURAMENTO.MENSAL}>
                            Mensal
                          </option>
                        </NativeSelect>
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_contrato_mensal"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Valor do Contrato Mensal <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value || 0}
                          onChange={(val) => {
                            field.onChange(val);
                            form.setValue("valor_base", val);
                          }}
                          placeholder="0,00"
                          className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-semibold focus:border-primary shadow-xs"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                {form.watch("periodicidade") === PERIODICIDADE_FATURAMENTO.MENSAL && (
                  <FormField
                    control={form.control}
                    name="dia_vencimento_padrao"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Dia de Vencimento da Fatura <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={31}
                            placeholder="Ex: 10, 15 ou 25"
                            value={field.value ?? 10}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {form.watch("periodicidade") === PERIODICIDADE_FATURAMENTO.QUINZENAL && (
                <Banner
                  variant="info"
                  title="Vencimentos Quinzenais Padronizados"
                  description="A 1ª Quinzena vence no dia 16 e a 2ª Quinzena vence no último dia do mês."
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border p-3.5 px-4 bg-surface-alt/40">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-foreground cursor-pointer">
                      Cliente Ativo
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Define se o cliente está habilitado para operações e faturamento
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
          onClick={() => safeCloseDialog(handleClose)}
          type="button"
        />
        <BaseDialog.Action
          label={editingClient ? "Salvar Alterações" : "Criar Cliente"}
          variant="primary"
          type="submit"
          form="client-form"
          isLoading={isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ClientFormDialog;

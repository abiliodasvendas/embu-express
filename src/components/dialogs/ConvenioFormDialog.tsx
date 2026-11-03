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
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { useCreateConvenio, useUpdateConvenio } from "@/hooks/api/useConvenios";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { cn } from "@/lib/utils";
import { Convenio } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { formatContaBancaria } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Handshake, Loader2, Calendar, Clock } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ConvenioFormValues, convenioSchema } from "@/schemas/convenioSchema";

interface ConvenioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioToEdit?: Convenio | null;
}

export function ConvenioFormDialog({
  open,
  onOpenChange,
  convenioToEdit,
}: ConvenioFormDialogProps) {
  const createConvenio = useCreateConvenio();
  const updateConvenio = useUpdateConvenio();
  const { data: empresas = [] } = useEmpresas();
  const { data: contasBancarias = [] } = useContasBancarias();

  const isEditing = !!convenioToEdit;
  const isLoading = createConvenio.isPending || updateConvenio.isPending;

  const form = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      nome: "",
      ativo: true,
      empresa_id: undefined as unknown as number,
      conta_bancaria_id: "",
      dia_vencimento_padrao: undefined as unknown as number,
      periodicidade: "MENSAL",
    },
  });

  const selectedEmpresaId = form.watch("empresa_id");
  const periodicidade = form.watch("periodicidade");

  const contasFiltradas = useMemo(() => {
    if (!selectedEmpresaId) return [];
    return contasBancarias.filter(
      (c) => c.ativo && Number(c.empresa_id) === Number(selectedEmpresaId)
    );
  }, [contasBancarias, selectedEmpresaId]);

  useEffect(() => {
    if (open) {
      if (convenioToEdit) {
        form.reset({
          nome: convenioToEdit.nome,
          ativo: convenioToEdit.ativo,
          empresa_id: convenioToEdit.empresa_id ? Number(convenioToEdit.empresa_id) : (undefined as unknown as number),
          conta_bancaria_id: convenioToEdit.conta_bancaria_id || "",
          dia_vencimento_padrao: convenioToEdit.dia_vencimento_padrao ?? (undefined as unknown as number),
          periodicidade: (convenioToEdit.periodicidade as "MENSAL" | "QUINZENAL" | "SEMANAL") || "MENSAL",
        });
      } else {
        form.reset({
          nome: "",
          ativo: true,
          empresa_id: undefined as unknown as number,
          conta_bancaria_id: "",
          dia_vencimento_padrao: undefined as unknown as number,
          periodicidade: "MENSAL",
        });
      }
    }
  }, [open, convenioToEdit, form]);

  const onSubmit = async (values: ConvenioFormValues) => {
    try {
      const payload = {
        nome: values.nome,
        ativo: values.ativo,
        empresa_id: Number(values.empresa_id),
        conta_bancaria_id: values.conta_bancaria_id,
        dia_vencimento_padrao: Number(values.dia_vencimento_padrao),
        periodicidade: values.periodicidade,
      };

      if (isEditing && convenioToEdit) {
        await updateConvenio.mutateAsync({
          id: convenioToEdit.id,
          ...payload,
        });
        toast.success("Convênio atualizado com sucesso!");
      } else {
        await createConvenio.mutateAsync(payload);
        toast.success("Convênio criado com sucesso!");
      }
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || "";
      toast.error(isEditing ? "Erro ao atualizar convênio" : "Erro ao criar convênio", {
        description: message,
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
        icon={<Handshake className="h-5 w-5 text-foreground" />}
        title={isEditing ? "Editar Convênio" : "Novo Convênio"}
        subtitle={
          isEditing
            ? "Atualize as informações do estabelecimento parceiro"
            : "Cadastre uma nova oficina, autopeça ou parceiro comercial"
        }
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="py-5 px-6">
        <Form {...form}>
          <form id="convenio-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nome do Convênio / Estabelecimento <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Handshake className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Oficina do João, AutoPeças Silva"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.nome && "border-destructive focus-visible:ring-destructive/20"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <div className={`grid grid-cols-1 gap-3 ${periodicidade === "MENSAL" ? "sm:grid-cols-2" : ""}`}>
              <FormField
                control={form.control}
                name="periodicidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Periodicidade da Fatura <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value || "MENSAL"}
                        onChange={(e) => field.onChange(e.target.value as "MENSAL" | "QUINZENAL" | "SEMANAL")}
                        className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                      >
                        <option value="MENSAL">Mensal</option>
                        <option value="QUINZENAL">Quinzenal</option>
                        <option value="SEMANAL">Semanal</option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              {periodicidade === "MENSAL" && (
                <FormField
                  control={form.control}
                  name="dia_vencimento_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Dia do Vencimento <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="Informe o dia (1 a 31)"
                          className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive ml-1" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {periodicidade === "QUINZENAL" && (
              <Banner
                variant="info"
                title="Vencimentos Quinzenais do Convênio"
                description="A 1ª Quinzena vence no dia 16 e a 2ª Quinzena vence no último dia do mês."
              />
            )}

            {periodicidade === "SEMANAL" && (
              <Banner
                variant="info"
                title="Ciclo Semanal do Convênio"
                description="Apuração de segunda a domingo com vencimento na terça-feira subsequente."
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Empresa Pagadora <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => {
                          const novoId = e.target.value ? Number(e.target.value) : (undefined as unknown as number);
                          field.onChange(novoId);
                          form.setValue("conta_bancaria_id", "", { shouldValidate: true });
                        }}
                        className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
                      >
                        <option value="">Selecione a empresa pagadora...</option>
                        {empresas
                          .filter((e) => e.ativo)
                          .map((emp) => (
                            <option key={emp.id} value={String(emp.id)}>
                              {emp.nome_fantasia}
                            </option>
                          ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conta_bancaria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Conta Bancária <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || "")}
                        disabled={!selectedEmpresaId}
                        className="h-11 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs disabled:opacity-60"
                      >
                        <option value="">
                          {!selectedEmpresaId
                            ? "Selecione a empresa pagadora antes..."
                            : contasFiltradas.length === 0
                            ? "Nenhuma conta cadastrada nesta empresa"
                            : "Selecione a conta bancária..."}
                        </option>
                        {contasFiltradas.map((conta) => (
                          <option key={conta.id} value={conta.id}>
                            {formatContaBancaria(conta)}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border p-3.5 px-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-semibold text-foreground cursor-pointer">
                      Status Ativo
                    </FormLabel>
                    <p className="text-[11px] text-muted-foreground">
                      Parceiros ativos podem receber novos lançamentos e manutenções
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
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="convenio-form"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Atualizar"
          ) : (
            "Salvar"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ConvenioFormDialog;

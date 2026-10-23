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
import { Handshake, Loader2 } from "lucide-react";
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
      empresa_id: null,
      conta_bancaria_id: null,
    },
  });

  const selectedEmpresaId = form.watch("empresa_id");

  const contasFiltradas = useMemo(() => {
    if (!selectedEmpresaId) return contasBancarias.filter((c) => c.ativo);
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
          empresa_id: convenioToEdit.empresa_id || null,
          conta_bancaria_id: convenioToEdit.conta_bancaria_id || null,
        });
      } else {
        form.reset({
          nome: "",
          ativo: true,
          empresa_id: null,
          conta_bancaria_id: null,
        });
      }
    }
  }, [open, convenioToEdit, form]);

  const onSubmit = async (values: ConvenioFormValues) => {
    try {
      if (isEditing && convenioToEdit) {
        await updateConvenio.mutateAsync({
          id: convenioToEdit.id,
          nome: values.nome,
          ativo: values.ativo,
          empresa_id: values.empresa_id ? Number(values.empresa_id) : null,
          conta_bancaria_id: values.conta_bancaria_id || null,
        });
        toast.success("Convênio atualizado com sucesso!");
      } else {
        await createConvenio.mutateAsync({
          nome: values.nome,
          ativo: values.ativo,
          empresa_id: values.empresa_id ? Number(values.empresa_id) : null,
          conta_bancaria_id: values.conta_bancaria_id || null,
        });
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Empresa Pagadora (Padrão)
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="h-11 rounded-[18px] bg-background"
                      >
                        <option value="">Nenhuma (definir na baixa)</option>
                        {empresas
                          .filter((e) => e.ativo)
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>
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
                      Conta Débito (Padrão)
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="h-11 rounded-[18px] bg-background"
                      >
                        <option value="">Nenhuma (definir na baixa)</option>
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
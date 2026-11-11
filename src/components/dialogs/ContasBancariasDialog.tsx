import { BaseDialog } from "@/components/ui/BaseDialog";
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
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContaBancariaForm } from "@/hooks/form/useContaBancariaForm";
import { ContaBancariaFormData } from "@/schemas/contaBancariaSchema";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cnpjMask } from "@/utils/masks";
import { toast } from "sonner";
import { Landmark } from "lucide-react";

export interface ContasBancariasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaIdInicial?: number;
}

export function ContasBancariasDialog({
  open,
  onOpenChange,
  empresaIdInicial,
}: ContasBancariasDialogProps) {
  const { createMutation } = useContasBancarias(empresaIdInicial);
  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresas();
  const { form } = useContaBancariaForm({ defaultEmpresaId: empresaIdInicial });

  const handleClose = () => {
    if (createMutation.isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  const onSubmit = async (values: ContaBancariaFormData) => {
    try {
      await createMutation.mutateAsync({
        empresa_id: Number(values.empresa_id),
        banco_nome: values.banco_nome.trim(),
        agencia: values.agencia?.trim() || undefined,
        conta: values.conta?.trim() || undefined,
        tipo_conta: values.tipo_conta,
      });

      toast.success("Conta bancária cadastrada com sucesso!");
      form.reset({
        empresa_id: empresaIdInicial || 0,
        banco_nome: "",
        agencia: "",
        conta: "",
        tipo_conta: "CORRENTE",
      });
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || err.message || "Erro ao cadastrar conta bancária.");
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="md"
      lockClose={createMutation.isPending}
    >
      <BaseDialog.Header
        icon={<Landmark className="h-5 w-5" />}
        title="Nova Conta Bancária"
        subtitle="Cadastre uma conta bancária vinculada a uma das empresas do grupo"
        onClose={handleClose}
      />

      <Form {...form}>
        <form id="conta-bancaria-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <BaseDialog.Body className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="empresa_id"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Empresa (CNPJ) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoadingEmpresas}
                      className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                    >
                      <option value="">Selecione a empresa...</option>
                      {empresas.map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>
                          {emp.nome_fantasia} {emp.cnpj ? `(${cnpjMask(emp.cnpj)})` : ""}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banco_nome"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nome do Banco <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Itaú, Santander, Bradesco, Banco do Brasil..."
                      {...field}
                      className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Agência
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 0123"
                        {...field}
                        className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conta"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Número da Conta
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 12345-6"
                        {...field}
                        value={field.value || ""}
                        className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipo_conta"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Tipo de Conta <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      {...field}
                      className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                    >
                      <option value="CORRENTE">Conta Corrente</option>
                      <option value="POUPANCA">Poupança</option>
                      <option value="PAGAMENTO">Pagamento</option>
                      <option value="INVESTIMENTO">Investimento</option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
          </BaseDialog.Body>
        </form>
      </Form>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={createMutation.isPending}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label="Salvar Conta"
          variant="primary"
          isLoading={createMutation.isPending}
          type="submit"
          form="conta-bancaria-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ContasBancariasDialog;

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
import { NativeSelect } from "@/components/ui/native-select";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContaBancariaForm } from "@/hooks/form/useContaBancariaForm";
import { ContaBancariaFormData } from "@/schemas/contaBancariaSchema";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cnpjMask } from "@/utils/masks";
import { toast } from "sonner";
import { Landmark, Loader2 } from "lucide-react";

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

  const onSubmit = async (values: ContaBancariaFormData) => {
    try {
      await createMutation.mutateAsync({
        empresa_id: Number(values.empresa_id),
        banco_nome: values.banco_nome.trim(),
        agencia: values.agencia?.trim() || undefined,
        conta: values.conta.trim(),
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
    } catch {
      toast.error("Erro ao cadastrar conta bancária.");
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Landmark className="h-5 w-5" />}
        title="Nova Conta Bancária"
        subtitle="Cadastre uma conta bancária vinculada a uma das empresas do grupo"
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
                      className="h-11 rounded-[14px] bg-background text-xs sm:text-sm font-medium"
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
                      className="h-11 rounded-[14px] bg-background text-xs sm:text-sm font-medium"
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
                        className="h-11 rounded-[14px] bg-background text-xs sm:text-sm font-medium"
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
                        className="h-11 rounded-[14px] bg-background text-xs sm:text-sm font-medium"
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
                      className="h-11 rounded-[14px] bg-background text-xs sm:text-sm font-medium"
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

          <BaseDialog.Footer className="p-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => safeCloseDialog(() => onOpenChange(false))}
              className="h-10 rounded-[14px] px-4 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-10 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 text-xs shadow-xs cursor-pointer"
            >
              {createMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              <span>Salvar Conta</span>
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}

export default ContasBancariasDialog;

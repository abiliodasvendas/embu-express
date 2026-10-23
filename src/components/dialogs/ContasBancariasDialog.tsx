import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContaBancariaForm } from "@/hooks/form/useContaBancariaForm";
import { ContaBancariaFormData } from "@/schemas/contaBancariaSchema";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatContaBancaria } from "@/utils/formatters";
import { toast } from "sonner";
import { Building2, CreditCard, Plus, Trash2, Loader2, Landmark, Wand2 } from "lucide-react";
import { cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";

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
  const { contas, isLoading, createMutation, deleteMutation } = useContasBancarias();
  const { data: empresas = [] } = useEmpresas();

  const [mostrarNovoFormulario, setMostrarNovoFormulario] = useState(false);
  const { form } = useContaBancariaForm({ defaultEmpresaId: empresaIdInicial });

  const onSubmitNovaConta = async (values: ContaBancariaFormData) => {
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
      setMostrarNovoFormulario(false);
    } catch {
      toast.error("Erro ao cadastrar conta bancária.");
    }
  };

  const handleExcluirConta = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Conta bancária removida.");
    } catch {
      toast.error("Não foi possível excluir a conta bancária.");
    }
  };

  const handleFillMock = () => {
    setMostrarNovoFormulario(true);
    const empId = empresaIdInicial || empresas[0]?.id || 1;
    const mockData = mockGenerator.contaBancaria(empId);
    form.reset(mockData);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="lg"
    >
      <BaseDialog.Header
        icon={<Landmark className="h-5 w-5" />}
        title="Contas Bancárias"
        subtitle="Gerencie as contas bancárias vinculadas às empresas do grupo"
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
        leftAction={
          process.env.NODE_ENV === "development" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillMock}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Mock
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contas Cadastradas
          </h4>
          {!mostrarNovoFormulario && (
            <Button
              type="button"
              size="sm"
              onClick={() => setMostrarNovoFormulario(true)}
              className="gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs h-9 rounded-[18px] px-3.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conta</span>
            </Button>
          )}
        </div>

        {mostrarNovoFormulario && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitNovaConta)}
              noValidate
              className="bg-surface-alt/50 border border-border rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-semibold text-foreground">
                  Cadastrar Nova Conta
                </span>
                <div className="flex items-center gap-1.5">
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFillMock}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      Mock
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarNovoFormulario(false)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
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
                          placeholder="Ex: Itaú, Santander, Bradesco..."
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
                          placeholder="Ex: 12345-6 (opcional p/ caixinha ou espécie)"
                          {...field}
                          value={field.value || ""}
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_conta"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 sm:col-span-2">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Tipo de Conta <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          {...field}
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                        >
                          <option value="CORRENTE">Conta Corrente</option>
                          <option value="POUPANCA">Poupança</option>
                        </NativeSelect>
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground rounded-[18px] shadow-xs cursor-pointer"
                >
                  {createMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  )}
                  <span>Salvar Conta</span>
                </Button>
              </div>
            </form>
          </Form>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-xs font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>Carregando contas...</span>
          </div>
        ) : contas.length === 0 ? (
          <UnifiedEmptyState
            icon={CreditCard}
            title="Nenhuma conta cadastrada"
            description="Cadastre as contas bancárias das empresas para conciliar recebimentos."
          />
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border/60 bg-card">
            {contas.map((c) => (
              <div
                key={c.id}
                className="p-3.5 hover:bg-surface-alt/60 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-muted/70 flex items-center justify-center text-foreground border border-border shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatContaBancaria(c)}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-border text-muted-foreground font-semibold"
                      >
                        {c.tipo_conta || "CORRENTE"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExcluirConta(c.id)}
                  disabled={deleteMutation.isPending}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
        >
          Fechar
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ContasBancariasDialog;

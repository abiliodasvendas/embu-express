import { isAxiosError } from "axios";
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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useMovimentacaoAvulsaForm } from "@/hooks/form/useMovimentacaoAvulsaForm";
import { MovimentacaoAvulsaFormData } from "@/schemas/movimentacaoAvulsaSchema";
import {
  MovimentacaoAvulsa,
  TipoMovimentacaoAvulsa,
  CategoriaMovimentacaoAvulsa,
} from "@/types/database";
import {
  TIPO_MOVIMENTACAO_AVULSA,
  CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
} from "@/constants/financeiro.constants";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Banknote, Wand2 } from "lucide-react";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatContaBancaria } from "@/utils/formatters";
import { mockGenerator } from "@/utils/mocks/generator";

export interface MovimentacaoAvulsaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  onSuccess?: () => void | Promise<void>;
}

const CATEGORIAS_ENTRADA: CategoriaMovimentacaoAvulsa[] = [
  "FRETE_ESPORADICO",
  "RENDIMENTO_APLICACAO",
  "REEMBOLSO_CLIENTE",
  "DOACAO_APORTE",
  "OUTRAS_ENTRADAS",
];

const CATEGORIAS_SAIDA: CategoriaMovimentacaoAvulsa[] = [
  "DESPESA_OPERACIONAL_AVULSA",
  "REEMBOLSO_DESPESA",
  "TARIFA_BANCARIA",
  "OUTRAS_SAIDAS",
];

export function MovimentacaoAvulsaFormDialog({
  open,
  onOpenChange,
  movimentacaoToEdit,
  onSuccess,
}: MovimentacaoAvulsaFormDialogProps) {
  const { createMutation, updateMutation } = useMovimentacoesAvulsas();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });

  const defaultEmpresaId = empresas[0]?.id;
  const { form } = useMovimentacaoAvulsaForm({
    open,
    movimentacaoToEdit,
    defaultEmpresaId,
  });

  const tipo = form.watch("tipo_movimentacao");
  const empresaId = form.watch("empresa_id");
  const { contas = [] } = useContasBancarias(empresaId ? Number(empresaId) : undefined);

  const categoriasDisponiveis =
    tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  const handleTipoChange = (novoTipo: TipoMovimentacaoAvulsa) => {
    form.setValue("tipo_movimentacao", novoTipo);
    if (novoTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA) {
      form.setValue("categoria", CATEGORIAS_ENTRADA[0]);
    } else {
      form.setValue("categoria", CATEGORIAS_SAIDA[0]);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: MovimentacaoAvulsaFormData) => {
    const payload = {
      tipo_movimentacao: values.tipo_movimentacao,
      empresa_id: Number(values.empresa_id),
      conta_bancaria_id:
        values.conta_bancaria_id && values.conta_bancaria_id !== "none"
          ? values.conta_bancaria_id
          : null,
      categoria: values.categoria as CategoriaMovimentacaoAvulsa,
      descricao: values.descricao.trim(),
      valor: values.valor,
      data_movimentacao: values.data_movimentacao,
    };

    try {
      if (movimentacaoToEdit) {
        await updateMutation.mutateAsync({ id: movimentacaoToEdit.id, data: payload });
        toast.success("Movimentação atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Lançamento avulso registrado com sucesso!");
      }
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao salvar movimentação avulsa.";
      toast.error(msg);
    }
  };

  const handleFillMock = () => {
    const empId = empresas[0]?.id || 1;
    const mockData = mockGenerator.movimentacaoAvulsa(empId);
    form.reset(mockData);
  };

  const handleClose = () => {
    if (isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={isPending}
    >
      <BaseDialog.Header
        icon={<Banknote className="h-5 w-5 text-foreground" />}
        title={movimentacaoToEdit ? "Editar Movimentação Avulsa" : "Novo Lançamento Avulso"}
        subtitle="Registre entradas ou saídas pontuais na conta bancária que não passam por fatura ou folha."
        onClose={handleClose}
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <BaseDialog.Body>
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Tipo de Movimentação <span className="text-destructive">*</span>
                </FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 rounded-[18px] text-xs font-medium gap-1.5 transition-all cursor-pointer ${
                      tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
                        ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => handleTipoChange(TIPO_MOVIMENTACAO_AVULSA.ENTRADA)}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Entrada / Receita
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 rounded-[18px] text-xs font-medium gap-1.5 transition-all cursor-pointer ${
                      tipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
                        ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => handleTipoChange(TIPO_MOVIMENTACAO_AVULSA.SAIDA)}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Saída / Despesa
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
                          <option value="">Selecione a empresa</option>
                          {empresas.map((emp) => (
                            <option key={emp.id} value={String(emp.id)}>
                              {emp.nome_fantasia || emp.razao_social}
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
                  name="conta_bancaria_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Conta Bancária (Opcional)
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value || "none"}
                          onChange={field.onChange}
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                        >
                          <option value="none">Nenhuma conta específica</option>
                          {contas.map((c) => (
                            <option key={c.id} value={c.id}>
                              {formatContaBancaria(c)}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Categoria <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        {...field}
                        className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                      >
                        {categoriasDisponiveis.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[cat] || cat}
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
                name="descricao"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Descrição do Lançamento <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Frete extra cliente ABC, Aplicação CDB, Taxa de Manutenção"
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
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Valor (R$) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MoneyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0,00"
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_movimentacao"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Data da Operação <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              disabled={isPending}
              onClick={handleClose}
              type="button"
            />
            <BaseDialog.Action
              label={movimentacaoToEdit ? "Salvar Alterações" : "Confirmar Lançamento"}
              variant="primary"
              isLoading={isPending}
              type="submit"
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}

export default MovimentacaoAvulsaFormDialog;

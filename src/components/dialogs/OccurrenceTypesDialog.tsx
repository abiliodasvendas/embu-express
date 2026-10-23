import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Switch } from "@/components/ui/switch";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import {
  useCreateTipoOcorrencia,
  useDeleteTipoOcorrencia,
  useUpdateTipoOcorrencia,
} from "@/hooks/api/useOcorrenciaMutations";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { TipoOcorrencia } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tipoOcorrenciaSchema = z
  .object({
    descricao: z.string().min(1, "A descrição é obrigatória"),
    valor_padrao: z.coerce.number().min(0, "O valor não pode ser negativo").default(0),
    impacto_financeiro: z.boolean().default(false),
    tipo_lancamento: z.enum(["ENTRADA", "SAIDA"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.impacto_financeiro) {
      if (!data.tipo_lancamento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Obrigatório quando há impacto financeiro",
          path: ["tipo_lancamento"],
        });
      }
      if (data.valor_padrao <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O valor deve ser maior que zero",
          path: ["valor_padrao"],
        });
      }
    }
  });

type TipoOcorrenciaFormData = z.infer<typeof tipoOcorrenciaSchema>;

interface OccurrenceTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OccurrenceTypesDialog({
  open,
  onOpenChange,
}: OccurrenceTypesDialogProps) {
  const { data: tipos = [], isLoading } = useTiposOcorrencia({ enabled: open });
  const [editingTipo, setEditingTipo] = useState<TipoOcorrencia | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const createMutation = useCreateTipoOcorrencia();
  const updateMutation = useUpdateTipoOcorrencia();
  const deleteMutation = useDeleteTipoOcorrencia();

  const form = useForm<TipoOcorrenciaFormData>({
    resolver: zodResolver(tipoOcorrenciaSchema),
    defaultValues: {
      descricao: "",
      valor_padrao: 0,
      impacto_financeiro: false,
      tipo_lancamento: "SAIDA",
    },
  });

  const handleEdit = (tipo: TipoOcorrencia) => {
    setEditingTipo(tipo);
    form.reset({
      descricao: tipo.descricao,
      valor_padrao: tipo.valor_padrao || 0,
      impacto_financeiro: tipo.impacto_financeiro,
      tipo_lancamento: tipo.tipo_lancamento || "SAIDA",
    });
    setIsFormVisible(true);
    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancel = () => {
    setEditingTipo(null);
    setIsFormVisible(false);
    form.reset({
      descricao: "",
      valor_padrao: 0,
      impacto_financeiro: false,
      tipo_lancamento: "SAIDA",
    });
  };

  const onSubmit = async (data: TipoOcorrenciaFormData) => {
    try {
      if (editingTipo) {
        await updateMutation.mutateAsync({ id: editingTipo.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCancel();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || "";
      toast.error(errorMessage || "Erro ao salvar tipo de ocorrência");
    }
  };

  const handleDelete = (tipo: TipoOcorrencia) => {
    openConfirmationDialog({
      title: "Excluir Tipo de Ocorrência",
      description: `Deseja realmente excluir "${tipo.descricao}"? Isso pode afetar ocorrências já registradas.`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(tipo.id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog open={open} onOpenChange={(val) => !val && handleClose()} maxWidth="lg">
      <BaseDialog.Header
        title="Gerenciar Tipos de Ocorrência"
        subtitle="Configure as categorias disponíveis para lançamento de ocorrências"
        icon={<Settings className="w-5 h-5 text-foreground" />}
      />

      <BaseDialog.Body className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tipos Cadastrados ({tipos.length})
          </h3>
          {!isFormVisible && (
            <Button
              onClick={() => {
                handleCancel();
                setIsFormVisible(true);
                setTimeout(() => {
                  formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              className="h-9 px-3.5 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold gap-1.5 shadow-xs text-xs"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Novo Tipo
            </Button>
          )}
        </div>

        {isFormVisible && (
          <div ref={formContainerRef} className="rounded-[20px] border border-border bg-muted/30 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {editingTipo ? "Editar Tipo" : "Cadastrar Novo Tipo"}
              </span>
            </div>

            <Form {...form}>
              <form id="type-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium text-muted-foreground">Descrição <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Falta, Atraso, Adiantamento..."
                          className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impacto_financeiro"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border bg-muted/30 p-3 shadow-xs">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs font-semibold text-foreground">Impacto Financeiro</FormLabel>
                        <p className="text-[11px] text-muted-foreground leading-tight">Gera lançamento financeiro automático.</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            if (val && !form.getValues("tipo_lancamento")) {
                              form.setValue("tipo_lancamento", "SAIDA");
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("impacto_financeiro") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="tipo_lancamento"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Lançamento <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || "SAIDA"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-semibold"
                            >
                              <option value="SAIDA">Saída (Débito)</option>
                              <option value="ENTRADA">Entrada (Crédito)</option>
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valor_padrao"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-medium text-muted-foreground">Valor Sugerido <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <MoneyInput
                              value={field.value}
                              onChange={field.onChange}
                              className="h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-9 px-3.5 rounded-[14px] text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-9 px-4 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs text-xs"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingTipo ? (
                      "Atualizar"
                    ) : (
                      "Salvar Tipo"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        <div className="space-y-2.5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-[16px] border border-border" />
              ))}
            </div>
          ) : tipos.length === 0 ? (
            <div className="bg-muted/20 border border-dashed border-border rounded-[20px] py-10 text-center">
              <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum tipo cadastrado.</p>
            </div>
          ) : (
            tipos.map((tipo) => (
              <div
                key={tipo.id}
                className="flex items-center justify-between p-3.5 bg-background rounded-[18px] border border-border hover:border-foreground/20 shadow-xs transition-all group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm text-foreground truncate">{tipo.descricao}</span>
                    {tipo.impacto_financeiro && (
                      <>
                        <Badge variant="outline" className="bg-muted text-foreground border-border text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-[6px]">
                          Financeiro
                        </Badge>
                        <Badge variant="outline" className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-[6px] bg-muted/70 text-foreground border-border">
                          {tipo.tipo_lancamento === "ENTRADA" ? "Crédito" : "Débito"}
                        </Badge>
                      </>
                    )}
                  </div>
                  {tipo.impacto_financeiro && (
                    <div className="text-[11px] text-muted-foreground font-medium mt-0.5 font-mono">
                      Sugerido: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tipo.valor_padrao || 0)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(tipo)}
                    className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tipo)}
                    className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Fechar
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

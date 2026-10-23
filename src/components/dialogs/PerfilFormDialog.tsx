import { BaseDialog } from "@/components/ui/BaseDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messages } from "@/constants/messages";
import { PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";
import { useCreatePerfil, usePermissoes, useUpdatePerfil } from "@/hooks/api/usePerfis";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { PerfilFormData, perfilSchema } from "@/schemas/perfilSchema";
import { Perfil } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

interface PerfilFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfilToEdit?: Perfil | null;
}

export function PerfilFormDialog({
  open,
  onOpenChange,
  perfilToEdit,
}: PerfilFormDialogProps) {
  const { data: permissoes } = usePermissoes();
  const createPerfil = useCreatePerfil();
  const updatePerfil = useUpdatePerfil();

  const isProtected = Boolean(
    perfilToEdit &&
      PROTECTED_ROLES_NAMES.includes(
        perfilToEdit.nome as unknown as (typeof PROTECTED_ROLES_NAMES)[number]
      )
  );

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      permissoes: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (perfilToEdit) {
        const perfilWithPermissions = perfilToEdit as Perfil & {
          detalhes_permissoes?: { id: number }[];
        };
        form.reset({
          id: perfilToEdit.id.toString(),
          nome: perfilToEdit.nome,
          descricao: perfilToEdit.descricao || "",
          permissoes:
            perfilWithPermissions.detalhes_permissoes?.map((p) => p.id) || [],
        });
      } else {
        form.reset({
          nome: "",
          descricao: "",
          permissoes: [],
        });
      }
    }
  }, [open, perfilToEdit, form]);

  const permissoesAgrupadas = useMemo(() => {
    if (!permissoes) return {};
    return permissoes.reduce((acc, current) => {
      const mod = current.modulo || "Outros";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(current);
      return acc;
    }, {} as Record<string, typeof permissoes>);
  }, [permissoes]);

  const onSubmit = async (values: PerfilFormData) => {
    try {
      if (perfilToEdit) {
        await updatePerfil.mutateAsync({
          id: perfilToEdit.id,
          data: {
            nome: values.nome,
            descricao: values.descricao,
            permissoes: values.permissoes,
          },
        });
        toast.success(messages.sucesso.atualizar);
      } else {
        await createPerfil.mutateAsync({
          nome: values.nome,
          descricao: values.descricao,
          permissoes: values.permissoes,
        });
        toast.success(messages.sucesso.salvar);
      }
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { error?: string } } };
      const message = err.message || "";
      if (message.toLowerCase().includes("perfis_nome_key") || message.toLowerCase().includes("nome já existe")) {
        form.setError("nome", { message: "Já existe um perfil com este nome." });
      } else {
        toast.error("Erro ao salvar", {
          description: err.response?.data?.error || message || "Verifique os dados.",
        });
      }
    }
  };

  const isSubmitting = createPerfil.isPending || updatePerfil.isPending;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="2xl"
      description="Formulário de cadastro e edição de perfil e permissões"
    >
      <BaseDialog.Header
        icon={<ShieldCheck className="h-5 w-5" />}
        title={perfilToEdit ? "Editar Perfil" : "Novo Perfil"}
        subtitle="Determine o nível de acesso e permissões operacionais deste perfil"
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-6 space-y-6">
        <Form {...form}>
          <form id="perfil-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  Dados do Perfil
                </h4>
                <p className="text-xs text-muted-foreground">
                  Identificação e atribuição de responsabilidades
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Nome do Perfil <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!!isProtected}
                          placeholder="Ex: Diretor de Operações"
                          className={cn(
                            "h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                            form.formState.errors.nome && "border-destructive focus-visible:ring-destructive/20"
                          )}
                          {...field}
                        />
                      </FormControl>
                      {!!isProtected && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Nome de perfil nativo do sistema não pode ser alterado.
                        </p>
                      )}
                      <FormMessage className="text-xs text-destructive ml-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Descrição
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Breve resumo da responsabilidade"
                          className={cn(
                            "h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                            form.formState.errors.descricao && "border-destructive focus-visible:ring-destructive/20"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive ml-1" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  Permissões de Acesso
                </h4>
                <p className="text-xs text-muted-foreground">
                  Selecione as ações e módulos que este perfil poderá acessar
                </p>
              </div>

              <FormField
                control={form.control}
                name="permissoes"
                render={({ field }) => (
                  <div className="space-y-5 pt-1">
                    {Object.entries(permissoesAgrupadas).map(([modulo, perms], index) => {
                      const allSelected = perms.every((p) => field.value?.includes(p.id));
                      return (
                        <div
                          key={modulo}
                          className={cn("space-y-2.5", index > 0 && "pt-4 border-t border-border/60")}
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-foreground flex items-center gap-2 tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {modulo}
                            </h5>

                            <div className="flex items-center gap-1.5 select-none">
                              <Checkbox
                                id={`select-all-${modulo}`}
                                checked={allSelected}
                                onCheckedChange={(checked) => {
                                  const current = new Set(field.value || []);
                                  if (checked) {
                                    perms.forEach((p) => current.add(p.id));
                                  } else {
                                    perms.forEach((p) => current.delete(p.id));
                                  }
                                  field.onChange(Array.from(current));
                                }}
                              />
                              <label
                                htmlFor={`select-all-${modulo}`}
                                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider cursor-pointer"
                              >
                                Todas
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {perms.map((permissao) => {
                              const isChecked = field.value?.includes(permissao.id);
                              return (
                                <div
                                  key={permissao.id}
                                  className="flex items-start gap-2.5 group py-1"
                                >
                                  <Checkbox
                                    id={`perm-${permissao.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const current = new Set(field.value || []);
                                      if (checked) {
                                        current.add(permissao.id);
                                      } else {
                                        current.delete(permissao.id);
                                      }
                                      field.onChange(Array.from(current));
                                    }}
                                    className="mt-0.5 shrink-0"
                                  />
                                  <label
                                    htmlFor={`perm-${permissao.id}`}
                                    className={cn(
                                      "text-xs leading-snug cursor-pointer select-none transition-colors",
                                      isChecked
                                        ? "font-medium text-foreground"
                                        : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                  >
                                    {permissao.descricao || permissao.nome_interno}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </section>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          label={perfilToEdit ? "Salvar Alterações" : "Criar Perfil"}
          variant="primary"
          type="submit"
          form="perfil-form"
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

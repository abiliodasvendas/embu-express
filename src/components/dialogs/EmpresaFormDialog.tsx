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
import { messages } from "@/constants/messages";
import { useCreateEmpresa, useUpdateEmpresa } from "@/hooks/api/useEmpresaMutations";
import { cn } from "@/lib/utils";
import { EmpresaFormValues, empresaSchema } from "@/schemas/empresaSchema";
import { Empresa } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Hash, Wand2 } from "lucide-react";
import { useEffect } from "react";
import { FieldErrors, useForm } from "react-hook-form";

interface EmpresaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaToEdit?: Empresa | null;
  onSuccess?: () => void;
}

export function EmpresaFormDialog({
  open,
  onOpenChange,
  empresaToEdit = null,
  onSuccess,
}: EmpresaFormDialogProps) {
  const createEmpresa = useCreateEmpresa();
  const updateEmpresa = useUpdateEmpresa();

  const isEditing = Boolean(empresaToEdit);
  const isLoading = createEmpresa.isPending || updateEmpresa.isPending;

  const handleClose = () => onOpenChange(false);

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome_fantasia: "",
      razao_social: "",
      cnpj: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (empresaToEdit) {
        form.reset({
          nome_fantasia: empresaToEdit.nome_fantasia,
          razao_social: empresaToEdit.razao_social || "",
          cnpj: cnpjMask(empresaToEdit.cnpj || ""),
        });
      } else {
        form.reset({
          nome_fantasia: "",
          razao_social: "",
          cnpj: "",
        });
      }
    }
  }, [open, empresaToEdit, form]);

  const handleFillMock = () => {
    const mockData = mockGenerator.empresa();
    form.reset({
      nome_fantasia: mockData.nome_fantasia,
      razao_social: mockData.razao_social,
      cnpj: cnpjMask(mockData.cnpj),
    });
  };

  const onFormError = (_errors: FieldErrors<EmpresaFormValues>) => {
    toast.error(messages.validacao.formularioComErros);
  };

  const onSubmit = async (values: EmpresaFormValues) => {
    try {
      if (isEditing && empresaToEdit) {
        await updateEmpresa.mutateAsync({
          id: empresaToEdit.id,
          ...values,
        });
      } else {
        await createEmpresa.mutateAsync(values);
      }
      safeCloseDialog(handleClose);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || "";
      toast.error(errorMessage || "Erro ao salvar empresa");
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(handleClose)}
      maxWidth="md"
      description="Formulário de cadastro e edição de empresa"
    >
      <BaseDialog.Header
        title={isEditing ? "Editar Empresa" : "Nova Empresa"}
        subtitle="Preencha os dados cadastrais da empresa"
        icon={<Building2 className="h-5 w-5 text-foreground" />}
        onClose={() => safeCloseDialog(handleClose)}
        leftAction={
          import.meta.env.DEV ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-[12px] border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleFillMock}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body className="p-6 space-y-4">
        <Form {...form}>
          <form
            id="empresa-form"
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nome_fantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nome Fantasia <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Embu Express"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.nome_fantasia && "border-destructive focus-visible:ring-destructive/20"
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
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Razão Social
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Embu Transportes Ltda"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.razao_social && "border-destructive focus-visible:ring-destructive/20"
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
                  <FormLabel className="text-xs font-semibold text-foreground">
                    CNPJ
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="00.000.000/0000-00"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.cnpj && "border-destructive focus-visible:ring-destructive/20"
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
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(handleClose)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="empresa-form"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Empresa"}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

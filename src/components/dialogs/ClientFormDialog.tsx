import { BaseDialog } from "@/components/ui/BaseDialog";
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
import { messages } from "@/constants/messages";
import { useCreateClient, useUpdateClient } from "@/hooks";
import { cn } from "@/lib/utils";
import { ClientFormData, clientSchema } from "@/schemas/clientSchema";
import { Client } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface ClientFormDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  editingClient?: Client | null;
  onSuccess?: () => void;
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

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome_fantasia: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          ativo: editingClient.ativo,
        });
      } else {
        form.reset({
          nome_fantasia: "",
          ativo: true,
        });
      }
    }
  }, [isDialogOpen, editingClient, form]);

  const onSubmit = async (values: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          nome_fantasia: values.nome_fantasia,
          ativo: values.ativo,
        });
        toast.success(messages.cliente.sucesso.atualizado);
        safeCloseDialog(handleClose);
        if (onSuccess) onSuccess();
      } else {
        const novo = await createClient.mutateAsync({
          nome_fantasia: values.nome_fantasia,
          ativo: values.ativo,
        });
        toast.success(messages.cliente.sucesso.criado);
        safeCloseDialog(handleClose);
        if (onSuccess) onSuccess();
        if (novo?.id) {
          navigate(`/admin/clientes/${novo.id}`);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || "";
      toast.error(
        editingClient
          ? messages.cliente.erro.atualizar
          : messages.cliente.erro.criar,
        { description: message }
      );
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <BaseDialog
      open={isDialogOpen}
      onOpenChange={(val) => !val && safeCloseDialog(handleClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Building2 className="h-5 w-5 text-foreground" />}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        subtitle={
          editingClient
            ? "Atualize as informações do cliente"
            : "Cadastre um novo grupo / cliente"
        }
        onClose={() => safeCloseDialog(handleClose)}
      />

      <BaseDialog.Body className="py-5 px-6">
        <Form {...form}>
          <form id="client-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="Ex: QualPharma, Drogaria São Paulo"
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary shadow-xs transition-all",
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

            <Banner
              variant="info"
              title="Faturamento e Contratos por Unidade"
              description="Os valores contratuais, periodicidades e datas de vencimento são gerenciados individualmente em cada unidade deste cliente."
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[18px] border border-border p-3.5 px-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-foreground cursor-pointer">
                      Cliente Ativo
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Define se o cliente está habilitado para operações
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

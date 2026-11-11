import { isAxiosError } from "axios";
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
import { Textarea } from "@/components/ui/textarea";
import { useIntercompany } from "@/hooks/api/useIntercompany";
import { useAcertoIntercompanyForm } from "@/hooks/form/useAcertoIntercompanyForm";
import { AcertoIntercompanyFormData } from "@/schemas/acertoIntercompanySchema";
import { TransferenciaIntercompany } from "@/types/database";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AcertoIntercompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferencia?: TransferenciaIntercompany | null;
  onSuccess?: () => void | Promise<void>;
}

export function AcertoIntercompanyDialog({
  open,
  onOpenChange,
  transferencia,
  onSuccess,
}: AcertoIntercompanyDialogProps) {
  const { registrarAcertoMutation } = useIntercompany();
  const { form } = useAcertoIntercompanyForm({ open, transferencia });

  if (!transferencia) return null;

  const handleSubmit = async (values: AcertoIntercompanyFormData) => {
    try {
      await registrarAcertoMutation.mutateAsync({
        transferencia_id: transferencia.id,
        data_acerto: values.data_acerto,
        observacao: values.observacao?.trim() || null,
      });
      toast.success("Acerto entre empresas registrado com sucesso!");
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao registrar acerto entre empresas.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (registrarAcertoMutation.isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="md"
      lockClose={registrarAcertoMutation.isPending}
    >
      <BaseDialog.Header
        icon={<ArrowRightLeft className="h-5 w-5 text-foreground" />}
        title="Registrar Acerto Entre Empresas"
        subtitle="Confirmação de repasse bancário do dinheiro recebido no lugar de outra empresa."
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <div className="bg-muted/30 border border-border rounded-[18px] p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Quem recebeu o dinheiro:</span>
              <span className="font-semibold text-foreground">
                {transferencia.empresa_devedora?.nome_fantasia || "Empresa A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Dona da fatura (Quem vai receber):</span>
              <span className="font-semibold text-foreground">
                {transferencia.empresa_credora?.nome_fantasia || "Empresa B"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted-foreground font-medium">Valor a Repassar:</span>
              <span className="font-bold text-sm text-foreground">
                {formatCurrency(transferencia.valor)}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              id="acerto-intercompany-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="data_acerto"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Data da Transferência / Acerto <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-11 rounded-[18px] text-xs sm:text-sm font-medium bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Observação do Repasse
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: TED realizada da CC 1234 para CC 5678..."
                        rows={2}
                        {...field}
                        value={field.value || ""}
                        className="rounded-[18px] text-xs sm:text-sm bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={registrarAcertoMutation.isPending}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label="Confirmar Acerto"
          variant="primary"
          isLoading={registrarAcertoMutation.isPending}
          type="submit"
          form="acerto-intercompany-form"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default AcertoIntercompanyDialog;

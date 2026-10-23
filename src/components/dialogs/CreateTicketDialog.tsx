import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, LifeBuoy, X, Upload, FileImage } from "lucide-react";
import { ticketSchema, TicketFormData } from "@/schemas/ticketSchema";
import { useCreateTicket, useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/database";
import { TicketType, TicketPriority, TICKET_TYPE_LABELS, TICKET_PRIORITY_LABELS } from "@/types/enums";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/utils/dialogUtils";
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
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketToEdit?: Ticket | null;
  onSuccess?: () => void;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  ticketToEdit,
  onSuccess,
}: CreateTicketDialogProps) {
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!ticketToEdit;

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      type: TicketType.BUG,
      priority: TicketPriority.MEDIUM,
      attachments: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (ticketToEdit) {
        form.reset({
          title: ticketToEdit.title,
          description: ticketToEdit.description,
          type: ticketToEdit.type,
          priority: ticketToEdit.priority,
          attachments: ticketToEdit.attachments || [],
        });
      } else {
        form.reset({
          title: "",
          description: "",
          type: TicketType.BUG,
          priority: TicketPriority.MEDIUM,
          attachments: [],
        });
        setSelectedFiles([]);
      }
    }
  }, [ticketToEdit, form, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("ticket-attachments")
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }
      return uploadedUrls;
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Erro ao fazer upload das imagens", {
        description: err.message,
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: TicketFormData) => {
    try {
      let attachmentsList = [...(values.attachments || [])];

      if (selectedFiles.length > 0) {
        const newUrls = await uploadAttachments();
        attachmentsList = [...attachmentsList, ...newUrls];
      }

      if (isEdit && ticketToEdit) {
        await updateMutation.mutateAsync({
          id: ticketToEdit.id,
          data: {
            title: values.title,
            description: values.description,
            type: values.type,
            priority: values.priority,
            attachments: attachmentsList,
          },
        });
        toast.success("Chamado atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync({
          ...values,
          attachments: attachmentsList,
        });
        toast.success("Chamado aberto com sucesso!");
      }

      onSuccess?.();
      safeCloseDialog(() => onOpenChange(false));
    } catch {
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="lg"
    >
      <BaseDialog.Header
        icon={<LifeBuoy className="h-5 w-5 text-foreground" />}
        title={isEdit ? "Editar Chamado" : "Novo Chamado / Sugestão"}
        subtitle={
          isEdit
            ? "Atualize as informações do chamado aberto"
            : "Abra uma solicitação de ajuste, melhoria ou relate um erro no sistema"
        }
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="py-5 px-6 space-y-4">
        <Form {...form}>
          <form id="ticket-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Título <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Erro ao carregar extrato no fechamento"
                      {...field}
                      className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Tipo <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value as TicketType)}
                        className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                      >
                        <option value={TicketType.BUG}>{TICKET_TYPE_LABELS[TicketType.BUG]}</option>
                        <option value={TicketType.FEATURE}>{TICKET_TYPE_LABELS[TicketType.FEATURE]}</option>
                        <option value={TicketType.IMPROVEMENT}>{TICKET_TYPE_LABELS[TicketType.IMPROVEMENT]}</option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Prioridade <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value as TicketPriority)}
                        className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                      >
                        <option value={TicketPriority.LOW}>{TICKET_PRIORITY_LABELS[TicketPriority.LOW]}</option>
                        <option value={TicketPriority.MEDIUM}>{TICKET_PRIORITY_LABELS[TicketPriority.MEDIUM]}</option>
                        <option value={TicketPriority.HIGH}>{TICKET_PRIORITY_LABELS[TicketPriority.HIGH]}</option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Descrição Detalhada <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente a situação, os passos para reproduzir ou a necessidade de melhoria..."
                      {...field}
                      className="min-h-[110px] rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all resize-none p-3.5"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <div className="space-y-2 pt-1">
              <FormLabel className="text-xs font-semibold text-foreground">
                Anexos (Prints / Evidências)
              </FormLabel>

              <div className="border-2 border-dashed border-border rounded-[18px] p-5 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto h-7 w-7 text-muted-foreground mb-1.5" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Clique ou arraste imagens aqui
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Formatos suportados: PNG, JPG ou JPEG
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Arquivos selecionados ({selectedFiles.length}):
                  </p>
                  <div className="space-y-1.5">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-[14px] bg-muted/40 border border-border text-xs text-foreground"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                          <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate font-medium">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[8px] shrink-0"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="ticket-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isEdit ? (
            "Salvar Alterações"
          ) : (
            "Abrir Chamado"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default CreateTicketDialog;

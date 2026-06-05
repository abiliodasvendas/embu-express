import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, X, Upload, FileImage } from "lucide-react";
import { ticketSchema, TicketFormData } from "@/schemas/ticketSchema";
import { useCreateTicket, useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/database";
import { TicketType, TicketPriority, TICKET_TYPE_LABELS, TICKET_PRIORITY_LABELS } from "@/types/enums";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      type: "" as any,
      priority: "" as any,
      attachments: [],
    },
  });

  useEffect(() => {
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
        type: "" as any,
        priority: "" as any,
        attachments: [],
      });
      setSelectedFiles([]);
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
    } catch (error: any) {
      toast.error("Erro ao fazer upload das imagens", {
        description: error.message,
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
      } else {
        await createMutation.mutateAsync({
          ...values,
          attachments: attachmentsList,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // toast.error is already handled by mutations
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isEdit ? "Editar Chamado" : "Novo Chamado / Sugestão"}
          </DialogTitle>
          <p className="text-xs text-white/70 mt-1">
            {isEdit ? "Atualize as informações do chamado" : "Abra uma solicitação de ajuste, melhoria ou relate um bug"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form id="ticket-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Erro no relatório de ponto"
                          {...field}
                          className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value={TicketType.BUG}>{TICKET_TYPE_LABELS[TicketType.BUG]}</SelectItem>
                            <SelectItem value={TicketType.FEATURE}>{TICKET_TYPE_LABELS[TicketType.FEATURE]}</SelectItem>
                            <SelectItem value={TicketType.IMPROVEMENT}>{TICKET_TYPE_LABELS[TicketType.IMPROVEMENT]}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value={TicketPriority.LOW}>{TICKET_PRIORITY_LABELS[TicketPriority.LOW]}</SelectItem>
                            <SelectItem value={TicketPriority.MEDIUM}>{TICKET_PRIORITY_LABELS[TicketPriority.MEDIUM]}</SelectItem>
                            <SelectItem value={TicketPriority.HIGH}>{TICKET_PRIORITY_LABELS[TicketPriority.HIGH]}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva detalhadamente sua solicitação ou o erro encontrado..."
                          {...field}
                          className="min-h-[120px] rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none p-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Anexar Prints / Imagens</FormLabel>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Clique para selecionar</p>
                  <p className="text-xs text-gray-500 mt-1">Formato suportado: Imagens (PNG, JPG)</p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Arquivos selecionados:</p>
                    <div className="divide-y divide-gray-100">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2 truncate">
                            <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="truncate font-medium">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="ticket-form"
            disabled={isPending}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

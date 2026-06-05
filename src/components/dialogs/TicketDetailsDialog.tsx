import { useState, useEffect, useRef } from "react";
import { useTicket, useTicketComments } from "@/hooks/api/useTickets";
import { useCreateTicketComment, useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Loader2, MessageSquare, Send, Calendar, User, CornerDownRight, Image as ImageIcon, X, Pencil, Check, Upload } from "lucide-react";
import { TicketType, TicketStatus, TicketPriority, TICKET_TYPE_LABELS, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from "@/types/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onSuccess?: () => void;
}

export function TicketDetailsDialog({
  open,
  onOpenChange,
  ticketId,
  onSuccess,
}: TicketDetailsDialogProps) {
  const { profile, isAdmin, isSuperAdmin } = usePermissions();
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { data: comments = [], isLoading: isLoadingComments } = useTicketComments(ticketId);
  const createCommentMutation = useCreateTicketComment();
  const updateMutation = useUpdateTicket();
  const [commentText, setCommentText] = useState("");
  const [localStatus, setLocalStatus] = useState<TicketStatus>(ticket?.status || TicketStatus.OPEN);
  const [localPriority, setLocalPriority] = useState<TicketPriority>(ticket?.priority || TicketPriority.LOW);
  const [localTitle, setLocalTitle] = useState<string>(ticket?.title || "");
  const [localDescription, setLocalDescription] = useState<string>(ticket?.description || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ticket) {
      setLocalStatus(ticket.status);
      setLocalPriority(ticket.priority);
      setLocalTitle(ticket.title);
      setLocalDescription(ticket.description);
    }
  }, [ticket]);

  const isUserAdmin = isAdmin || isSuperAdmin;
  const isAuthor = ticket?.author_id === profile?.id;
  const canEditPriority = isUserAdmin || isAuthor;

  const handleStatusChange = (newStatus: TicketStatus) => {
    setLocalStatus(newStatus);
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    setLocalPriority(newPriority);
  };

  const handleSave = async () => {
    if (!ticket) return;
    const data: Partial<typeof ticket> = {};
    if (localStatus !== ticket.status) data.status = localStatus;
    if (localPriority !== ticket.priority) data.priority = localPriority;

    if (Object.keys(data).length === 0) return;

    await updateMutation.mutateAsync({ id: ticketId, data });
    onSuccess?.();
  };

  const handleSaveTitle = async () => {
    if (!ticket) return;
    if (!localTitle.trim() || localTitle === ticket.title) {
      setIsEditingTitle(false);
      return;
    }
    await updateMutation.mutateAsync({ id: ticketId, data: { title: localTitle } });
    setIsEditingTitle(false);
    onSuccess?.();
  };

  const handleSaveDescription = async () => {
    if (!ticket) return;
    if (localDescription === ticket.description) {
      setIsEditingDescription(false);
      return;
    }
    await updateMutation.mutateAsync({ id: ticketId, data: { description: localDescription } });
    setIsEditingDescription(false);
    onSuccess?.();
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ticket) return;
    if (!e.target.files || e.target.files.length === 0) return;
    const filesArray = Array.from(e.target.files);

    setUploadingAttachment(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesArray) {
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

      if (uploadedUrls.length > 0) {
        const currentAttachments = ticket.attachments || [];
        const newAttachments = [...currentAttachments, ...uploadedUrls];

        await updateMutation.mutateAsync({
          id: ticketId,
          data: { attachments: newAttachments }
        });

        onSuccess?.();
      }
    } catch (error: any) {
      toast.error("Erro ao enviar anexo(s)", {
        description: error.message
      });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createCommentMutation.mutateAsync({ ticketId, content: commentText });
    setCommentText("");
  };



  const getTypeBadgeClass = (type: TicketType) => {
    switch (type) {
      case TicketType.BUG:
        return "bg-red-50 text-red-600 border-red-100";
      case TicketType.FEATURE:
        return "bg-blue-50 text-green-600 border-green-100";
      case TicketType.IMPROVEMENT:
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  if (isLoading || !ticket) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-white border-b border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getTypeBadgeClass(ticket.type)}>
                {TICKET_TYPE_LABELS[ticket.type]}
              </Badge>
              <span className="text-xs text-gray-400 font-medium">#{ticket.id.slice(0, 8)}</span>
            </div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="h-9 font-bold text-gray-950 bg-gray-50 border-gray-200 focus:bg-white text-base py-1 px-2.5 rounded-xl shadow-none"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  disabled={updateMutation.isPending || !localTitle.trim()}
                  className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-full shrink-0"
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setLocalTitle(ticket.title);
                    setIsEditingTitle(false);
                  }}
                  disabled={updateMutation.isPending}
                  className="h-9 w-9 text-gray-400 hover:bg-gray-100 rounded-full shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <DialogTitle className="text-xl font-bold text-gray-900 truncate flex items-center gap-2 group">
                <span>{ticket.title}</span>
                {canEditPriority && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-40 hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded transition-opacity"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </DialogTitle>
            )}
          </div>
          <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Autor</p>
                  <p className="text-gray-900 mt-0.5">{ticket.author?.nome_completo || "Desconhecido"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Criado em</p>
                  <p className="text-gray-900 mt-0.5">
                    {ticket.created_at ? format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="col-span-1 sm:col-span-5 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                {isUserAdmin ? (
                  <Select onValueChange={handleStatusChange} value={localStatus}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-100 text-xs font-bold">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={TicketStatus.CANCELED} className="font-bold text-gray-500">{TICKET_STATUS_LABELS[TicketStatus.CANCELED]}</SelectItem>
                      <SelectItem value={TicketStatus.OPEN} className="font-bold text-blue-600">{TICKET_STATUS_LABELS[TicketStatus.OPEN]}</SelectItem>
                      <SelectItem value={TicketStatus.IN_PROGRESS} className="font-bold text-yellow-600">{TICKET_STATUS_LABELS[TicketStatus.IN_PROGRESS]}</SelectItem>
                      <SelectItem value={TicketStatus.DONE} className="font-bold text-green-600">{TICKET_STATUS_LABELS[TicketStatus.DONE]}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs font-bold text-gray-950 bg-gray-100 px-3 py-1.5 rounded-full inline-block mt-1">
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </span>
                )}
              </div>

              <div className="col-span-1 sm:col-span-5 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prioridade</p>
                {canEditPriority ? (
                  <Select onValueChange={handlePriorityChange} value={localPriority}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-100 text-xs font-bold">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={TicketPriority.LOW} className="font-bold">{TICKET_PRIORITY_LABELS[TicketPriority.LOW]}</SelectItem>
                      <SelectItem value={TicketPriority.MEDIUM} className="font-bold">{TICKET_PRIORITY_LABELS[TicketPriority.MEDIUM]}</SelectItem>
                      <SelectItem value={TicketPriority.HIGH} className="font-bold text-red-600">{TICKET_PRIORITY_LABELS[TicketPriority.HIGH]}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs font-bold text-gray-950 bg-gray-100 px-3 py-1.5 rounded-full inline-block mt-1">
                    {TICKET_PRIORITY_LABELS[ticket.priority]}
                  </span>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || (localStatus === ticket.status && localPriority === ticket.priority)}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Salvar</span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center group">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Descrição</h4>
              {canEditPriority && !isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="opacity-40 hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded transition-opacity flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  ref={(el) => {
                    if (el) {
                      const length = el.value.length;
                      el.focus();
                      el.setSelectionRange(length, length);
                    }
                  }}
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  className="min-h-[120px] rounded-xl bg-gray-50 border-gray-200 focus:bg-white resize-none p-4 text-sm shadow-none"
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setLocalDescription(ticket.description);
                      setIsEditingDescription(false);
                    }}
                    disabled={updateMutation.isPending}
                    className="h-8 rounded-lg text-xs font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveDescription}
                    disabled={updateMutation.isPending}
                    className="h-8 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            )}

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anexos:</h5>
                {canEditPriority && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadAttachment}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 rounded-lg flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                    >
                      {uploadingAttachment ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      <span>Adicionar Anexos</span>
                    </Button>
                  </div>
                )}
              </div>

              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Anexo {index + 1}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic font-medium ml-0.5">Nenhum anexo enviado</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span>Discussão e Comentários</span>
            </h4>

            {isLoadingComments ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                    <div className="bg-blue-50 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-800 text-xs truncate">
                          {comment.author?.nome_completo || "Desconhecido"}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {comment.created_at ? format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-50 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-xs text-gray-400 font-medium">Nenhum comentário ainda. Inicie a conversa abaixo!</p>
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2 items-end bg-white border border-gray-100 p-2 rounded-2xl shadow-sm">
              <CornerDownRight className="h-4 w-4 text-gray-400 ml-2 mb-3 shrink-0 hidden sm:block" />
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Faça um comentário..."
                className="flex-1 min-h-[44px] h-11 py-3 px-3 bg-gray-50 border-gray-50 hover:bg-white focus:bg-white rounded-xl resize-none text-xs transition-all shadow-none"
              />
              <Button
                type="submit"
                disabled={createCommentMutation.isPending || !commentText.trim()}
                className="h-11 w-11 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center p-0"
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

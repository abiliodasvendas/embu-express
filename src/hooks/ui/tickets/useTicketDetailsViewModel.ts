import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTicket, useTicketComments } from "@/hooks/api/useTickets";
import { useCreateTicketComment, useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { TicketStatus, TicketPriority } from "@/types/enums";

interface UseTicketDetailsViewModelProps {
  ticketId: string;
  onSuccess?: () => void;
}

export function useTicketDetailsViewModel({
  ticketId,
  onSuccess,
}: UseTicketDetailsViewModelProps) {
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

  const handleSaveMeta = async () => {
    if (!ticket) return;
    const data: Partial<typeof ticket> = {};
    if (localStatus !== ticket.status) data.status = localStatus;
    if (localPriority !== ticket.priority) data.priority = localPriority;

    if (Object.keys(data).length === 0) return;

    await updateMutation.mutateAsync({ id: ticketId, data });
    toast.success("Informações atualizadas com sucesso!");
    onSuccess?.();
  };

  const handleSaveTitle = async () => {
    if (!ticket) return;
    if (!localTitle.trim() || localTitle === ticket.title) {
      setIsEditingTitle(false);
      return;
    }
    await updateMutation.mutateAsync({ id: ticketId, data: { title: localTitle } });
    toast.success("Título atualizado com sucesso!");
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
    toast.success("Descrição atualizada com sucesso!");
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
          data: { attachments: newAttachments },
        });

        toast.success("Anexo(s) adicionado(s) com sucesso!");
        onSuccess?.();
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Erro ao enviar anexo(s)", {
        description: err.message,
      });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createCommentMutation.mutateAsync({ ticketId, content: commentText.trim() });
    setCommentText("");
  };

  const hasMetaChanges =
    ticket && (localStatus !== ticket.status || localPriority !== ticket.priority);

  return {
    ticket,
    isLoading,
    comments,
    isLoadingComments,
    isSubmittingComment: createCommentMutation.isPending,
    isPendingUpdate: updateMutation.isPending,
    commentText,
    setCommentText,
    localStatus,
    localPriority,
    localTitle,
    setLocalTitle,
    localDescription,
    setLocalDescription,
    isEditingTitle,
    setIsEditingTitle,
    isEditingDescription,
    setIsEditingDescription,
    uploadingAttachment,
    fileInputRef,
    canEditPriority,
    isUserAdmin,
    hasMetaChanges,
    handleStatusChange,
    handlePriorityChange,
    handleSaveMeta,
    handleSaveTitle,
    handleSaveDescription,
    handleUploadAttachment,
    handleAddComment,
  };
}

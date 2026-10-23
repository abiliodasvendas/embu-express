import { BaseDialog } from "@/components/ui/BaseDialog";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TICKET_TYPE_LABELS } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useTicketDetailsViewModel } from "@/hooks/ui/tickets";
import {
  TicketDetailsSkeleton,
  TicketMetaHeader,
  TicketDescriptionAttachments,
  TicketCommentsSection,
} from "./ticket-details";

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
  const {
    ticket,
    isLoading,
    comments,
    isLoadingComments,
    isSubmittingComment,
    isPendingUpdate,
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
  } = useTicketDetailsViewModel({ ticketId, onSuccess });

  const handleClose = () => safeCloseDialog(() => onOpenChange(false));

  if (isLoading || !ticket) {
    return <TicketDetailsSkeleton open={open} onClose={handleClose} />;
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && handleClose()}
      maxWidth="2xl"
    >
      <BaseDialog.Header
        icon={<MessageSquare className="h-5 w-5 text-foreground" />}
        title={`Chamado #${ticket.id.slice(0, 8)}`}
        subtitle={`Aberto por ${ticket.author?.nome_completo || "Desconhecido"} • ${TICKET_TYPE_LABELS[ticket.type]} em ${
          ticket.created_at
            ? format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
            : "N/A"
        }`}
        onClose={handleClose}
      />

      <BaseDialog.Body className="py-5 px-6 space-y-5">
        <TicketMetaHeader
          title={ticket.title}
          localTitle={localTitle}
          setLocalTitle={setLocalTitle}
          isEditingTitle={isEditingTitle}
          setIsEditingTitle={setIsEditingTitle}
          canEditPriority={canEditPriority}
          isUserAdmin={isUserAdmin}
          localStatus={localStatus}
          localPriority={localPriority}
          hasMetaChanges={!!hasMetaChanges}
          isPendingUpdate={isPendingUpdate}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onSaveTitle={handleSaveTitle}
          onSaveMeta={handleSaveMeta}
        />

        <TicketDescriptionAttachments
          description={ticket.description}
          localDescription={localDescription}
          setLocalDescription={setLocalDescription}
          isEditingDescription={isEditingDescription}
          setIsEditingDescription={setIsEditingDescription}
          canEditPriority={canEditPriority}
          isPendingUpdate={isPendingUpdate}
          onSaveDescription={handleSaveDescription}
          attachments={ticket.attachments}
          uploadingAttachment={uploadingAttachment}
          fileInputRef={fileInputRef}
          onUploadAttachment={handleUploadAttachment}
        />

        <TicketCommentsSection
          comments={comments}
          isLoadingComments={isLoadingComments}
          isSubmittingComment={isSubmittingComment}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
        />
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default TicketDetailsDialog;

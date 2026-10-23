import { BaseDialog } from "@/components/ui/BaseDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { safeCloseDialog } from "@/utils/dialogUtils";

interface TicketDetailsSkeletonProps {
  open: boolean;
  onClose: () => void;
}

export function TicketDetailsSkeleton({ open, onClose }: TicketDetailsSkeletonProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(onClose)}
      maxWidth="2xl"
    >
      <BaseDialog.Header
        icon={<MessageSquare className="h-5 w-5 text-foreground" />}
        title="Carregando Chamado..."
        subtitle="Obtendo detalhes e histórico"
        onClose={() => safeCloseDialog(onClose)}
      />
      <BaseDialog.Body className="py-6 px-6 space-y-4">
        <Skeleton className="h-6 w-3/4 rounded-[8px] bg-muted/60" />
        <Skeleton className="h-20 w-full rounded-[18px] bg-muted/40" />
        <Skeleton className="h-32 w-full rounded-[18px] bg-muted/40" />
      </BaseDialog.Body>
    </BaseDialog>
  );
}

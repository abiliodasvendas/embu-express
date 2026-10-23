import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  TicketStatus,
  TicketPriority,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
} from "@/types/enums";
import { Check, Loader2, Pencil, X } from "lucide-react";

interface TicketMetaHeaderProps {
  title: string;
  localTitle: string;
  setLocalTitle: (title: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (editing: boolean) => void;
  canEditPriority: boolean;
  isUserAdmin: boolean;
  localStatus: TicketStatus;
  localPriority: TicketPriority;
  hasMetaChanges: boolean;
  isPendingUpdate: boolean;
  onStatusChange: (status: TicketStatus) => void;
  onPriorityChange: (priority: TicketPriority) => void;
  onSaveTitle: () => void;
  onSaveMeta: () => void;
}

export function TicketMetaHeader({
  title,
  localTitle,
  setLocalTitle,
  isEditingTitle,
  setIsEditingTitle,
  canEditPriority,
  isUserAdmin,
  localStatus,
  localPriority,
  hasMetaChanges,
  isPendingUpdate,
  onStatusChange,
  onPriorityChange,
  onSaveTitle,
  onSaveMeta,
}: TicketMetaHeaderProps) {
  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Título da Solicitação
          </span>
          {canEditPriority && !isEditingTitle && (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-muted-foreground hover:text-foreground text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors p-1"
            >
              <Pencil className="h-3 w-3" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="h-10 font-bold text-foreground bg-background border-border text-sm rounded-[14px]"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onSaveTitle}
              disabled={isPendingUpdate || !localTitle.trim()}
              className="h-9 w-9 text-foreground hover:bg-muted rounded-[10px] shrink-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setLocalTitle(title);
                setIsEditingTitle(false);
              }}
              disabled={isPendingUpdate}
              className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-[10px] shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h3 className="text-base font-bold text-foreground leading-snug">
            {title}
          </h3>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3.5 rounded-[18px] border border-border bg-muted/20">
        <div className="col-span-1 sm:col-span-5 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Status
          </span>
          {isUserAdmin ? (
            <NativeSelect
              value={localStatus}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
              className="h-10 rounded-[14px] bg-background border-border text-xs font-semibold"
            >
              <option value={TicketStatus.OPEN}>{TICKET_STATUS_LABELS[TicketStatus.OPEN]}</option>
              <option value={TicketStatus.IN_PROGRESS}>
                {TICKET_STATUS_LABELS[TicketStatus.IN_PROGRESS]}
              </option>
              <option value={TicketStatus.DONE}>{TICKET_STATUS_LABELS[TicketStatus.DONE]}</option>
              <option value={TicketStatus.CANCELED}>
                {TICKET_STATUS_LABELS[TicketStatus.CANCELED]}
              </option>
            </NativeSelect>
          ) : (
            <span className="text-xs font-semibold text-foreground bg-muted px-3 py-1.5 rounded-[12px] inline-block border border-border">
              {TICKET_STATUS_LABELS[localStatus]}
            </span>
          )}
        </div>

        <div className="col-span-1 sm:col-span-5 space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Prioridade
          </span>
          {canEditPriority ? (
            <NativeSelect
              value={localPriority}
              onChange={(e) => onPriorityChange(e.target.value as TicketPriority)}
              className="h-10 rounded-[14px] bg-background border-border text-xs font-semibold"
            >
              <option value={TicketPriority.LOW}>{TICKET_PRIORITY_LABELS[TicketPriority.LOW]}</option>
              <option value={TicketPriority.MEDIUM}>
                {TICKET_PRIORITY_LABELS[TicketPriority.MEDIUM]}
              </option>
              <option value={TicketPriority.HIGH}>
                {TICKET_PRIORITY_LABELS[TicketPriority.HIGH]}
              </option>
            </NativeSelect>
          ) : (
            <span className="text-xs font-semibold text-foreground bg-muted px-3 py-1.5 rounded-[12px] inline-block border border-border">
              {TICKET_PRIORITY_LABELS[localPriority]}
            </span>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2 flex justify-end">
          <Button
            onClick={onSaveMeta}
            disabled={isPendingUpdate || !hasMetaChanges}
            className="w-full h-10 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold shadow-xs flex items-center justify-center transition-all disabled:opacity-50"
          >
            {isPendingUpdate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

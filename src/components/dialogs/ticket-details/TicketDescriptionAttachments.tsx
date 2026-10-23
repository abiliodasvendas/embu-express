import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Loader2, Pencil, Upload } from "lucide-react";
import React from "react";

interface TicketDescriptionAttachmentsProps {
  description: string;
  localDescription: string;
  setLocalDescription: (desc: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (editing: boolean) => void;
  canEditPriority: boolean;
  isPendingUpdate: boolean;
  onSaveDescription: () => void;
  attachments?: string[] | null;
  uploadingAttachment: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TicketDescriptionAttachments({
  description,
  localDescription,
  setLocalDescription,
  isEditingDescription,
  setIsEditingDescription,
  canEditPriority,
  isPendingUpdate,
  onSaveDescription,
  attachments,
  uploadingAttachment,
  fileInputRef,
  onUploadAttachment,
}: TicketDescriptionAttachmentsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Descrição
        </span>
        {canEditPriority && !isEditingDescription && (
          <button
            type="button"
            onClick={() => setIsEditingDescription(true)}
            className="text-muted-foreground hover:text-foreground text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors p-1"
          >
            <Pencil className="h-3 w-3" />
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
            className="min-h-[110px] rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary resize-none p-3.5"
          />
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setLocalDescription(description);
                setIsEditingDescription(false);
              }}
              disabled={isPendingUpdate}
              className="h-8 rounded-[12px] text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={onSaveDescription}
              disabled={isPendingUpdate}
              className="h-8 rounded-[12px] text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs"
            >
              {isPendingUpdate ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-[18px] border border-border/40">
          {description}
        </p>
      )}

      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Anexos ({attachments?.length || 0}):
          </span>
          {canEditPriority && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={onUploadAttachment}
                className="hidden"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAttachment}
                className="h-7 text-[10px] font-semibold text-foreground hover:bg-muted px-2.5 rounded-[10px] flex items-center gap-1 uppercase tracking-wider"
              >
                {uploadingAttachment ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Upload className="h-3 w-3 mr-1" />
                )}
                <span>Adicionar Anexo</span>
              </Button>
            </div>
          )}
        </div>

        {attachments && attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-card border border-border hover:border-border/80 transition-colors px-3 py-2 rounded-[14px] text-xs font-semibold text-foreground shadow-2xs"
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span>Anexo {index + 1}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Nenhum anexo enviado.</p>
        )}
      </div>
    </div>
  );
}

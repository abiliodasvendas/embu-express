import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { TicketComment } from "@/types/database";

interface TicketCommentsSectionProps {
  comments: TicketComment[];
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: (e: React.FormEvent) => void;
}

export function TicketCommentsSection({
  comments,
  isLoadingComments,
  isSubmittingComment,
  commentText,
  setCommentText,
  onAddComment,
}: TicketCommentsSectionProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-border/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Discussão e Comentários ({comments.length})</span>
        </span>
      </div>

      {isLoadingComments ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[16px] border border-border bg-card p-3.5 flex items-start gap-3 shadow-xs"
            >
              <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 font-bold text-xs">
                {comment.author?.nome_completo?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground text-xs truncate">
                    {comment.author?.nome_completo || "Desconhecido"}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {comment.created_at
                      ? format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[16px] border border-dashed border-border/80 p-5 text-center bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Nenhum comentário ainda. Inicie a conversa abaixo.
          </p>
        </div>
      )}

      <form
        onSubmit={onAddComment}
        className="flex gap-2 items-center rounded-[18px] border border-border bg-background p-1.5 shadow-xs"
      >
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Escreva um comentário..."
          className="h-10 text-xs sm:text-sm bg-transparent border-0 focus-visible:ring-0 shadow-none px-3 flex-1"
        />
        <Button
          type="submit"
          disabled={isSubmittingComment || !commentText.trim()}
          className="h-10 w-10 shrink-0 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs flex items-center justify-center p-0"
        >
          {isSubmittingComment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

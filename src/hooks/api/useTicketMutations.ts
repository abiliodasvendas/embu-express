import { messages } from "@/constants/messages";
import { ticketService } from "@/services/api/ticket.api";
import { Ticket, TicketComment } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Ticket>) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(messages.chamado.sucesso.criado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.chamado.erro.criar, {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      ticketService.updateTicket(id, data),
    onSuccess: (updatedTicket, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.setQueryData(["ticket", variables.id], updatedTicket);
      toast.success(messages.chamado.sucesso.atualizado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.chamado.erro.atualizar, {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(messages.chamado.sucesso.excluido);
    },
    onError: (error: ApiError) => {
      toast.error(messages.chamado.erro.excluir, {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

export function useCreateTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      ticketService.createComment(ticketId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", variables.ticketId] });
      toast.success(messages.chamado.sucesso.comentado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.chamado.erro.comentar, {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

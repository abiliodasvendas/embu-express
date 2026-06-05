import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ticketService } from "@/services/api/ticket.api";
import { Ticket, TicketComment } from "@/types/database";

export function useTickets(options?: Omit<UseQueryOptions<Ticket[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: () => ticketService.listTickets(),
    staleTime: 0,
    refetchOnMount: true,
    ...options
  });
}

export function useTicket(id: string, options?: Omit<UseQueryOptions<Ticket>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getTicket(id),
    enabled: !!id,
    ...options
  });
}

export function useTicketComments(ticketId: string, options?: Omit<UseQueryOptions<TicketComment[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => ticketService.listComments(ticketId),
    enabled: !!ticketId,
    ...options
  });
}

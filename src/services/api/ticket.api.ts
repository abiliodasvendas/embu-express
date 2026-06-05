import { apiClient } from "./client";
import { Ticket, TicketComment } from "@/types/database";

export const ticketService = {
  async listTickets() {
    const response = await apiClient.get<Ticket[]>("/tickets");
    return response.data;
  },

  async getTicket(id: string) {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  async createTicket(data: Partial<Ticket>) {
    const response = await apiClient.post<Ticket>("/tickets", data);
    return response.data;
  },

  async updateTicket(id: string, data: Partial<Ticket>) {
    const response = await apiClient.put<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  async deleteTicket(id: string) {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  async listComments(ticketId: string) {
    const response = await apiClient.get<TicketComment[]>(`/tickets/${ticketId}/comentarios`);
    return response.data;
  },

  async createComment(ticketId: string, content: string) {
    const response = await apiClient.post<TicketComment>(`/tickets/${ticketId}/comentarios`, { content });
    return response.data;
  }
};

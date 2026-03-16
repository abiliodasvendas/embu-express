import { QueryClient } from "@tanstack/react-query";

/**
 * Configuração do React Query
 * 
 * staleTime: Tempo que os dados são considerados "frescos" (não refaz requisição)
 * cacheTime: Tempo que os dados ficam no cache após componente desmontar
 * refetchOnWindowFocus: Refaz requisição ao focar a janela (útil para dados em tempo real)
 * refetchOnReconnect: Refaz requisição ao reconectar à internet
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados frescos por 5 min
      gcTime: 1000 * 60 * 30, // 30 minutos - mantém no cache por 30 min (antigo cacheTime)
      refetchOnWindowFocus: true, // Atualiza ao focar a janela
      retry: (failureCount, error: any) => {
        // Se for erro de rede (sem response), tentamos até 3 vezes
        if (!error.response && failureCount < 3) return true;
        
        // Para outros erros (4xx, 5xx), não tentamos automaticamente
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      refetchOnMount: false,
    },
  },
});

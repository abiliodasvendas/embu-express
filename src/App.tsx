import { AppGate } from "@/components/auth/AppGate";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BackButtonController from "./components/navigation/BackButtonController";
import ScrollToTop from "./components/navigation/ScrollToTop";

import { lazyLoad } from "@/utils/lazyLoad";
import { Collaborators } from "./pages/admin/Collaborators";

// Lazy loading de rotas principais
const Login = lazyLoad(() => import("./pages/Login"));
const NovaSenha = lazyLoad(() => import("./pages/NovaSenha"));

// Admin - Embu Express
const TimeTracking = lazyLoad(() => import("./pages/admin/TimeTracking"));
const Clients = lazyLoad(() => import("./pages/admin/Clients"));

const NotFound = lazyLoad(() => import("./pages/NotFound"));

/**
 * Configuração do React Query
 * 
 * staleTime: Tempo que os dados são considerados "frescos" (não refaz requisição)
 * cacheTime: Tempo que os dados ficam no cache após componente desmontar
 * refetchOnWindowFocus: Refaz requisição ao focar a janela (útil para dados em tempo real)
 * refetchOnReconnect: Refaz requisição ao reconectar à internet
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados frescos por 5 min
      gcTime: 1000 * 60 * 30, // 30 minutos - mantém no cache por 30 min (antigo cacheTime)
      refetchOnWindowFocus: true, // Atualiza ao focar a janela
      refetchOnReconnect: true, // Atualiza ao reconectar
      retry: false, // Não tenta novamente se falhar
      refetchOnMount: false, // Não refaz ao montar se dados estão frescos
    },
  },
});

const App = () => {
  // Componente de loading para Suspense
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner richColors visibleToasts={1} />
        <AppErrorBoundary>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <BackButtonController />
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            {/* Rotas Públicas */}
            <Route
              path="/login"
              element={
                <AppGate>
                  <Login />
                </AppGate>
              }
            />


            <Route
              path="/nova-senha"
              element={
                <AppGate>
                  <NovaSenha />
                </AppGate>
              }
            />

            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {/* Rotas Protegidas - Admin */}
            <Route
              element={
                <AppGate>
                  <AppLayout />
                </AppGate>
              }
            >
              <Route path="controle-ponto" element={<TimeTracking />} />
              <Route path="colaboradores" element={<Collaborators />} />
              <Route path="clientes" element={<Clients />} />
              
              {/* Fallback para a home do admin */}
              <Route path="inicio" element={<Navigate to="/controle-ponto" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </BrowserRouter>
        </AppErrorBoundary>

      </TooltipProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;

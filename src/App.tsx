import { AppGate } from "@/components/auth/AppGate";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BackButtonController from "./components/navigation/BackButtonController";
import ScrollToTop from "./components/navigation/ScrollToTop";

import { lazyLoad } from "@/utils/lazyLoad";
import { RequireRole } from "./components/auth/RequireRole";
import { usePermissions } from "./hooks/business/usePermissions";
import { ADMIN_ROLES, OPERATIONAL_ROLES } from "./types/auth";

// Lazy loading de rotas principais
const Login = lazyLoad(() => import("./pages/Login"));
const NovaSenha = lazyLoad(() => import("./pages/NovaSenha"));
const SelfRegistration = lazyLoad(() => import("./pages/public/SelfRegistration"));

// Admin - Embu Express
const TimeTracking = lazyLoad(() => import("./pages/admin/TimeTracking"));
const Collaborators = lazyLoad(() => import("./pages/admin/Collaborators"));
const CollaboratorDetails = lazyLoad(() => import("./pages/admin/CollaboratorDetails"));
const Clients = lazyLoad(() => import("./pages/admin/Clients"));
const Empresas = lazyLoad(() => import("./pages/admin/Empresas"));
const RegistrarPonto = lazyLoad(() => import("./pages/operational/RegistrarPonto"));

const NotFound = lazyLoad(() => import("./pages/NotFound"));


import { queryClient } from "@/services/queryClient";

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
              path="/cadastro"
              element={<SelfRegistration />}
            />

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
              <Route path="inicio" element={<RedirectByRole />} />

              {/* Rotas Operacionais (Motoboy) */}
              <Route element={<RequireRole allowedRoles={OPERATIONAL_ROLES} />}>
                 <Route path="registrar-ponto" element={<RegistrarPonto />} />
              </Route>

              {/* Rotas Administrativas (Admin/SuperAdmin) */}
              <Route element={<RequireRole allowedRoles={ADMIN_ROLES} />}>
                <Route path="controle-ponto" element={<TimeTracking />} />
                <Route path="colaboradores" element={<Collaborators />} />
                <Route path="colaboradores/:id" element={<CollaboratorDetails />} />
                <Route path="clientes" element={<Clients />} />
                <Route path="empresas" element={<Empresas />} />
              </Route>
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

// Componente auxiliar para redirecionamento inteligente
const RedirectByRole = () => {
    const { isAdmin, isMotoboy, isLoading } = usePermissions();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAdmin) {
        return <Navigate to="/controle-ponto" replace />;
    }
    if (isMotoboy) {
        return <Navigate to="/registrar-ponto" replace />;
    }
    
    // Default fallback
    return <Navigate to="/registrar-ponto" replace />;
};

export default App;

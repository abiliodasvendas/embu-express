import { AppGate } from "@/components/auth/AppGate";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import AppLayout from "@/layouts/AppLayout";
import { apiClient } from "@/services/api/client";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import BackButtonController from "./components/navigation/BackButtonController";
import ScrollToTop from "./components/navigation/ScrollToTop";

import { lazyLoad } from "@/utils/lazyLoad";
import { RequirePermission } from "./components/auth/RequirePermission";
import { usePermissions } from "./hooks/business/usePermissions";

// Lazy loading de rotas principais
const Login = lazyLoad(() => import("./pages/Login"));
const NovaSenha = lazyLoad(() => import("./pages/NovaSenha"));
const SelfRegistration = lazyLoad(() => import("./pages/public/SelfRegistration"));

// Admin - Embu Express
const TimeTracking = lazyLoad(() => import("./pages/admin/TimeTracking"));
const Inicio = lazyLoad(() => import("./pages/admin/Inicio.tsx"));
const Collaborators = lazyLoad(() => import("./pages/admin/Collaborators"));
const CollaboratorDetails = lazyLoad(() => import("./pages/admin/CollaboratorDetails"));
const Clients = lazyLoad(() => import("./pages/admin/Clients"));
const ClientDetails = lazyLoad(() => import("./pages/admin/ClientDetails"));
const Empresas = lazyLoad(() => import("./pages/admin/Empresas"));
const Perfis = lazyLoad(() => import("./pages/admin/Perfis"));
const Configuracoes = lazyLoad(() => import("./pages/admin/Configuracoes"));
const Feriados = lazyLoad(() => import("./pages/admin/Feriados"));
const RegistrarPonto = lazyLoad(() => import("./pages/operational/RegistrarPonto"));

const NotFound = lazyLoad(() => import("./pages/NotFound"));


import { queryClient } from "@/services/queryClient";

const App = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    latest_version: string;
    url_zip: string;
  } | null>(null);


  useEffect(() => {
    const runUpdater = async () => {
      if (!Capacitor.isNativePlatform()) return;

      // Pequeno delay para garantir que a rede está estável no boot
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const { data } = await apiClient.get("/app/updates", {
          params: { platform: Capacitor.getPlatform() }
        });

        if (!data) return;

        const { latest_version, url_zip, force_update } = data;
        const current = await CapacitorUpdater.current();

        const currentVersion =
          current?.bundle?.version || current?.native || "builtin";

        if (currentVersion === latest_version) return;

        if (force_update) {
          setPendingUpdate({ latest_version, url_zip });
          setShowUpdateDialog(true);
          return;
        }

        try {
          toast.info("Atualização disponível", {
            description: "Baixando melhorias em segundo plano...",
          });

          const version = await CapacitorUpdater.download({
            version: latest_version,
            url: url_zip,
          });

          await CapacitorUpdater.next({ id: version.id });
          localStorage.setItem("pendingUpdate", version.id);

          toast.success("Atualização pronta!", {
            description: "O aplicativo será atualizado no próximo acesso.",
          });
        } catch (err) {
          // Erro silencioso
        }
      } catch (err) {
        // Erro geral
      }
    };

    runUpdater();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const notifyReady = async () => {
      try {
        const current = await CapacitorUpdater.current();
        const pending = localStorage.getItem("pendingUpdate");

        if (pending && pending === current?.bundle?.id) {
          localStorage.removeItem("pendingUpdate");
          toast.success("Aplicativo atualizado", {
            description: "Você está usando a versão mais recente.",
          });
        }

        await CapacitorUpdater.notifyAppReady();
      } catch (err) {
        // Erro silencioso
      }
    };

    notifyReady();
  }, []);

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



                {/* Rotas Protegidas - Admin */}
                <Route
                  element={
                    <AppGate>
                      <AppLayout />
                    </AppGate>
                  }
                >
                  <Route index element={<RedirectByRole />} />

                  {/* Rotas Operacionais (Motoboy) */}
                  <Route element={<RequirePermission requireOperational={true} />}>
                    <Route path={ROUTES.PRIVATE.REGISTRAR_PONTO.replace("/", "")} element={<RegistrarPonto />} />
                  </Route>

                  {/* Rotas Administrativas (Admin/SuperAdmin) */}
                  <Route element={<RequirePermission requireAdminPanel={true} />}>
                    <Route path={ROUTES.PRIVATE.INICIO.replace("/", "")} element={<Inicio />} />
                    <Route path={ROUTES.PRIVATE.CONTROLE_PONTO.replace("/", "")} element={<TimeTracking />} />
                    <Route path={ROUTES.PRIVATE.COLABORADORES.replace("/", "")} element={<Collaborators />} />
                    <Route path={ROUTES.PRIVATE.COLABORADOR_DETAILS.replace(/^\//, "")} element={<CollaboratorDetails />} />
                    <Route path={ROUTES.PRIVATE.CLIENTES.replace("/", "")} element={<Clients />} />
                    <Route path={ROUTES.PRIVATE.CLIENTE_DETAILS.replace(/^\//, "")} element={<ClientDetails />} />
                    <Route path={ROUTES.PRIVATE.EMPRESAS.replace("/", "")} element={<Empresas />} />
                    <Route path={ROUTES.PRIVATE.PERFIS.replace("/", "")} element={<Perfis />} />
                    <Route path={ROUTES.PRIVATE.CONFIGURACOES.replace("/", "")} element={<Configuracoes />} />
                    <Route path={ROUTES.PRIVATE.FERIADOS.replace("/", "")} element={<Feriados />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppErrorBoundary>

        {/* 🔹 Dialog de confirmação de atualização */}
        <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Nova versão disponível
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base pt-2">
                Uma nova versão do aplicativo está disponível. O aplicativo será
                atualizado agora para garantir o melhor funcionamento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-end">
              <AlertDialogAction
                onClick={async () => {
                  setShowUpdateDialog(false);
                  if (!pendingUpdate) return;

                  setUpdating(true);
                  setProgress(0);

                  try {
                    const listener = await CapacitorUpdater.addListener(
                      "download",
                      (info: any) => {
                        if (info?.percent !== undefined)
                          setProgress(Math.round(info.percent));
                      }
                    );

                    const version = await CapacitorUpdater.download({
                      version: pendingUpdate.latest_version,
                      url: pendingUpdate.url_zip,
                    });

                    await listener.remove();
                    await CapacitorUpdater.set(version);
                    await CapacitorUpdater.reload();
                  } catch (err) {
                    setUpdating(false);
                    setPendingUpdate(null);
                    toast.error("Erro na atualização", {
                      description:
                        "Não foi possível aplicar a atualização. Tente novamente.",
                    });
                  }
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 🔹 Overlay de atualização forçada */}
        {updating && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white">
            <Loader2 className="animate-spin w-10 h-10 mb-3" />
            <p className="text-lg font-medium mb-2">
              Atualizando o aplicativo...
            </p>
            <p className="text-sm opacity-80">{progress}% concluído</p>
          </div>
        )}
      </TooltipProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

// Componente auxiliar para redirecionamento inteligente
const RedirectByRole = () => {
  const { isAdmin, isSuperAdmin, isMotoboy, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isSuperAdmin) {
    return <Navigate to={ROUTES.PRIVATE.INICIO} replace />;
  }
  if (isMotoboy) {
    return <Navigate to={ROUTES.PRIVATE.REGISTRAR_PONTO} replace />;
  }

  // Default fallback
  return <Navigate to={ROUTES.PRIVATE.REGISTRAR_PONTO} replace />;
};

export default App;

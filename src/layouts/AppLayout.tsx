import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { loading: loadingSession } = useSession();
  const { profile, isLoading } = usePermissions();
  const { openPasswordGuardDialog } = useLayout();
  const navigate = useNavigate();

  const showGuard = !!profile?.senha_padrao;

  useEffect(() => {
    if (showGuard) {
      openPasswordGuardDialog({
        onSuccess: () => window.location.reload(),
      });
    }
  }, [showGuard, openPasswordGuardDialog]);

  if (loadingSession || isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-white/10 bg-[#0a0a0a] shadow-xs">
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-6 shrink-0">
          <img
            src="/assets/logo-embuexpress.png"
            alt="Embu Express"
            className="h-10 w-auto cursor-pointer brightness-0 invert hover:opacity-90 transition-opacity"
            onClick={() => navigate(ROUTES.PRIVATE.INICIO)}
          />
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          <AppSidebar />
        </div>
      </aside>

      <main className="pt-[calc(6rem+var(--safe-area-top))] pb-[calc(2.5rem+var(--safe-area-bottom))] md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-72 flex-1 min-w-0 transition-all">
        <Outlet />
      </main>
    </div>
  );
}

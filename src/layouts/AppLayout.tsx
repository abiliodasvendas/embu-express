import { PasswordGuardDialog } from "@/components/dialogs/PasswordGuardDialog";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { loading: loadingSession } = useSession();
  const { profile, isLoading } = usePermissions();
  const navigate = useNavigate();

  if (loadingSession || isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  const showGuard = !!profile?.senha_padrao;

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50">
        <PasswordGuardDialog
          open={showGuard}
          onSuccess={() => window.location.reload()}
        />
        <AppNavbar />

        <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-gray-100 bg-white">
          <div className="flex h-20 items-center justify-center border-b border-gray-50">
            <img
              src="/assets/logo-embuexpress.png"
              alt="Embu Express"
              className="h-12 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <AppSidebar />
          </div>
        </aside>

        <main className="pt-[6.5rem] pb-10 md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-72 min-h-screen">
          <Outlet />
        </main>
      </div>
    </LayoutProvider>
  );
}

import { CollaboratorQuickSearch } from "./CollaboratorQuickSearch";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { sessionManager } from "@/services/sessionManager";
import {
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  UserPen,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AppNavbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { pageTitle, openEditarCadastroDialog, openAlterarSenhaDialog } = useLayout();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile(!isSigningOut ? user?.id : undefined);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await sessionManager.signOut();
      navigate(ROUTES.PUBLIC.LOGIN);
    } catch {
      // Ignored
    } finally {
      setIsSigningOut(false);
    }
  };

  const userInitial = useMemo(() => {
    return profile?.nome_completo?.charAt(0)?.toUpperCase() || "U";
  }, [profile?.nome_completo]);

  const firstName = useMemo(() => {
    return profile?.nome_completo?.split(" ")[0];
  }, [profile?.nome_completo]);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-border bg-white/95 backdrop-blur-md h-[calc(4.5rem+var(--safe-area-top))] pt-[var(--safe-area-top)] transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 gap-3 sm:gap-6">
        <div className="flex items-center gap-3 shrink-0 md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-border bg-background text-foreground hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 border-r border-white/10 bg-[#0a0a0a] text-white p-0 flex flex-col h-full"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader className="flex flex-col items-center justify-center pt-[calc(1.5rem+var(--safe-area-top))] pb-6 border-b border-white/10 shrink-0 px-6">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <img
                  src="/assets/logo-embuexpress.png"
                  alt="Embu Express"
                  className="h-10 w-auto cursor-pointer brightness-0 invert"
                  onClick={() => {
                    navigate(ROUTES.PRIVATE.INICIO);
                    setIsSheetOpen(false);
                  }}
                />
              </SheetHeader>
              <div className="flex-1 overflow-hidden p-5">
                <AppSidebar onLinkClick={() => setIsSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 max-w-xl min-w-0">
          <CollaboratorQuickSearch />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full p-0 sm:px-2.5 sm:py-1.5 border-0 sm:border sm:border-border/80 bg-transparent sm:bg-background/50 hover:bg-background transition-colors cursor-pointer"
              >
                <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  <span>{userInitial}</span>
                </div>
                {firstName && (
                  <span className="hidden sm:inline-block text-xs font-semibold text-foreground">
                    {firstName}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 hidden sm:inline text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-[18px] border-border bg-white shadow-md p-1.5" align="end">
              <DropdownMenuItem
                onClick={openEditarCadastroDialog}
                className="rounded-[12px] cursor-pointer text-xs font-medium py-2"
              >
                <UserPen className="mr-2.5 h-4 w-4 text-muted-foreground" /> Editar Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={openAlterarSenhaDialog}
                className="rounded-[12px] cursor-pointer text-xs font-medium py-2"
              >
                <Lock className="mr-2.5 h-4 w-4 text-muted-foreground" /> Alterar senha
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60 my-1" />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-[12px] cursor-pointer text-xs font-semibold py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2.5 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

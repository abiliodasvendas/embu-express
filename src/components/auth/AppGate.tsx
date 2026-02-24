import { useSession } from "@/hooks/business/useSession";
import { Navigate, useLocation } from "react-router-dom";

export const AppGate = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
  const location = useLocation();

  const publicPaths = [
    "/",
    "/login",
    "/nova-senha",
  ];

  const isPublic = publicPaths.includes(location.pathname);

  // Enquanto ainda carrega sessão, mostra spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 🔹 Se não está logado e a rota é pública → libera
  if (!session && isPublic) {
    return <>{children}</>;
  }

  // 🔹 Se não está logado e a rota é protegida → manda pro login
  if (!session && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Se já está logado e tentar acessar login/nova-senha desnecessariamente -> manda pro root
  if (session && ["/login", "/nova-senha"].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  // Caso normal → renderiza conteúdo
  return <>{children}</>;
};

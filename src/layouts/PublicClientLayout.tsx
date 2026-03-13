import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { usePublicClient } from "@/hooks/api/usePublicClient";
import { Building2, CalendarDays, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicClientLayout() {
    const { uuid } = useParams();
    const { data: client, isLoading, error } = usePublicClient(uuid);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
                    <Skeleton className="h-8 w-32" />
                </nav>
                <main className="p-6 max-w-7xl mx-auto">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
                </main>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                    <TriangleAlert className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Indisponível</h1>
                <p className="text-gray-500 max-w-sm">
                    {error instanceof Error ? error.message : "O link que você tentou acessar é inválido ou expirou."}
                </p>
                <p className="mt-4 text-sm font-medium text-primary">Entre em contato com o Administrativo da Embu Express.</p>
            </div>
        );
    }

    const navItems = [
        { label: "Controle de Ponto", path: `/public/c/${uuid}/controle`, icon: Clock },
        { label: "Espelho de Ponto", path: `/public/c/${uuid}/espelho`, icon: CalendarDays },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FC]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-gray-900 leading-none">{client.nome_fantasia}</h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Painel do Cliente</p>
                            </div>
                        </div>

                        {/* Navigation Desktop */}
                        <nav className="hidden sm:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname.includes(item.path.split('/').pop()!);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                            isActive 
                                                ? "bg-primary/10 text-primary" 
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
                <Outlet context={{ client }} />
            </main>

            {/* Mobile Navigation */}
            <nav className="sm:hidden fixed bottom-6 left-4 right-4 bg-white shadow-2xl shadow-primary/20 border border-gray-100 rounded-2xl p-2 flex gap-2 z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.path.split('/').pop()!);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all",
                                isActive 
                                    ? "bg-primary text-white" 
                                    : "text-gray-400 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{item.label.split(' ')[0]}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

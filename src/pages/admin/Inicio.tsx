import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";

export default function Inicio() {
  const { setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Página Inicial");
  }, [setPageTitle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-slate-800 mb-2">Página Inicial</h1>
      <p className="text-slate-500 max-w-md">
        Bem-vindo ao painel do Embu Express. Em breve, você encontrará aqui um resumo das atividades e estatísticas.
      </p>
    </div>
  );
}

import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";

export default function TimeTracking() {
  const { setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Controle de Ponto");
  }, [setPageTitle]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <h1 className="text-2xl font-bold text-gray-400">Controle de Ponto</h1>
    </div>
  );
}

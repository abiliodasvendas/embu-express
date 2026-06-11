import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ParcelasPreviewProps {
  dataBase: string;
  quantidadeParcelas: number;
  valorTotal: number;
  className?: string;
}

export function ParcelasPreview({ dataBase, quantidadeParcelas, valorTotal, className }: ParcelasPreviewProps) {
  if (!dataBase || !quantidadeParcelas || quantidadeParcelas < 2 || valorTotal === undefined || valorTotal === null) return null;

  const parcelas = [];
  const baseDate = new Date(dataBase + "T12:00:00Z");

  for (let i = 0; i < quantidadeParcelas; i++) {
    const currentDate = new Date(baseDate);
    const currentMonth = currentDate.getUTCMonth();
    currentDate.setUTCMonth(currentMonth + i);
    
    // Adjust if month overflowed incorrectly
    if (currentDate.getUTCMonth() !== ((currentMonth + i) % 12)) {
        currentDate.setUTCDate(0); // Rollback to last day of previous month
    }
    
    parcelas.push({
      indice: i + 1,
      data: currentDate,
      valor: valorTotal
    });
  }

  return (
    <div className={cn("pt-2 animate-in fade-in slide-in-from-top-2 duration-300", className)}>
      <div className="flex flex-wrap gap-2">
        {parcelas.map((parcela) => (
          <div key={parcela.indice} className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-gray-50">
              {parcela.indice}/{quantidadeParcelas}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-600 leading-tight">
                {format(parcela.data, "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 leading-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.valor)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrintReportHeaderProps {
  titulo: string;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  mes: number;
  ano: number;
}

const NOMETES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function PrintReportHeader({
  titulo,
  colaboradorNome,
  cpf,
  cargo,
  mes,
  ano,
}: PrintReportHeaderProps) {
  const mesExtenso = NOMETES_MESES[mes - 1] || "";
  const dataEmissao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div className="hidden print:block mb-6 border-b-2 border-gray-900 pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">Embu Express</h1>
          <p className="text-xs text-gray-600 font-semibold uppercase">{titulo}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Referência</p>
          <p className="text-sm font-black text-gray-900 capitalize">
            {mesExtenso} / {ano}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Colaborador</span>
          <span className="font-bold text-gray-900">{colaboradorNome || "-"}</span>
        </div>
        {cpf && (
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase block">CPF</span>
            <span className="font-medium text-gray-800">{cpf}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[9px] text-gray-400 text-right">
        Emitido em: {dataEmissao}
      </div>
    </div>
  );
}

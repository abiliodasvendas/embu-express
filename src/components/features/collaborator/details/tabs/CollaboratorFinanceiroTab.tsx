import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { meses } from "@/utils/formatters/constants";
import { FileText, Plus, Printer, Wallet } from "lucide-react";

interface CollaboratorFinanceiroTabProps {
  colaboradorId: string;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  selectedMes: number;
  selectedAno: number;
  modoComprovanteRenda: boolean;
  onSelectMes: (mes: number) => void;
  onSelectAno: (ano: number) => void;
  onRegisterOccurrence: () => void;
  onToggleModoComprovanteRenda: () => void;
}

export function CollaboratorFinanceiroTab({
  colaboradorId,
  colaboradorNome,
  cpf,
  cargo,
  selectedMes,
  selectedAno,
  modoComprovanteRenda,
  onSelectMes,
  onSelectAno,
  onRegisterOccurrence,
  onToggleModoComprovanteRenda,
}: CollaboratorFinanceiroTabProps) {
  const anosDisponiveis = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <Card className="border-0 shadow-sm rounded-[24px] min-h-[500px] print:shadow-none print:border-none print:p-0">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-6 pt-6 px-6 sm:px-8 gap-4 print:hidden">
        <div>
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-semibold">Fechamento Financeiro</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Relatórios de pagamentos e descontos.
              </span>
            </div>
          </CardTitle>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <NativeSelect
            value={String(selectedMes)}
            onChange={(e) => onSelectMes(Number(e.target.value))}
            className="w-[130px] h-10 rounded-[18px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
          >
            {meses.map((label, index) => (
              <option key={index} value={String(index + 1)}>
                {label}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={String(selectedAno)}
            onChange={(e) => onSelectAno(Number(e.target.value))}
            className="w-[94px] h-10 rounded-[18px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={String(ano)}>
                {ano}
              </option>
            ))}
          </NativeSelect>

          <Button
            onClick={onRegisterOccurrence}
            className="h-10 rounded-[18px] px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Registrar Ocorrência</span>
          </Button>

          <Button
            onClick={onToggleModoComprovanteRenda}
            variant="outline"
            className={cn(
              "h-10 rounded-[18px] flex items-center gap-1.5 font-medium text-xs px-3.5 shadow-xs select-none transition-all",
              modoComprovanteRenda
                ? "bg-foreground text-background border-foreground"
                : "border-border text-foreground hover:bg-muted/50"
            )}
            title="Alternar exibição apenas de valores fixos contratuais (sem descontos ou adicionais variáveis)"
          >
            <FileText className="h-4 w-4" />
            <span>{modoComprovanteRenda ? "Visão Fixa Ativa" : "Comprovante de Renda"}</span>
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-10 rounded-[18px] flex items-center gap-1.5 border-border text-foreground hover:bg-muted/50 font-medium text-xs px-3.5 shadow-xs select-none"
            title="Imprimir ou Salvar PDF"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span>Imprimir PDF</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-6 print:p-0">
        <FinancialReportView
          usuarioId={colaboradorId}
          colaboradorNome={colaboradorNome}
          cpf={cpf}
          cargo={cargo}
          selectedMonth={selectedMes}
          selectedYear={selectedAno}
          modoComprovanteRenda={modoComprovanteRenda}
          onToggleModoComprovanteRenda={onToggleModoComprovanteRenda}
        />
      </CardContent>
    </Card>
  );
}

import { CircleDollarSign, Calendar, Clock } from "lucide-react";
import { DayConfigCard } from "../cards/DayConfigCard";
import { MoneyConfigCard } from "../cards/MoneyConfigCard";
import { PercentConfigCard } from "../cards/PercentConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface FinanceiroTabProps {
  configSalarios?: ConfigItem;
  configConvenios?: ConfigItem;
  configVales?: ConfigItem;
  configFeriado?: ConfigItem;
  configConvenioLimite?: ConfigItem;
  onSave: (chave: string, valor: string) => void;
  isSaving: (chave: string) => boolean;
}

export function FinanceiroTab({
  configSalarios,
  configConvenios,
  configVales,
  configFeriado,
  configConvenioLimite,
  onSave,
  isSaving,
}: FinanceiroTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {configSalarios && (
        <DayConfigCard
          config={configSalarios}
          onSave={(valor) => onSave(configSalarios.chave, valor)}
          isSaving={isSaving(configSalarios.chave)}
          title="Dia de Desembolso de Salários"
          description="Dia padrão do mês previsto para pagamento do saldo líquido da folha anterior aos colaboradores."
          example="Ex: Se definido como 7, o fluxo de caixa projeta a saída do salário no dia 07 do mês."
          icon={CircleDollarSign}
        />
      )}

      {configConvenios && (
        <DayConfigCard
          config={configConvenios}
          onSave={(valor) => onSave(configConvenios.chave, valor)}
          isSaving={isSaving(configConvenios.chave)}
          title="Dia de Desembolso de Convênios"
          description="Dia padrão do mês para pagamento e repasse de faturas de oficinas e postos parceiros."
          example="Ex: Se definido como 15, os saldos retidos dos convênios serão programados para pagamento no dia 15."
          icon={Calendar}
        />
      )}

      {configVales && (
        <DayConfigCard
          config={configVales}
          onSave={(valor) => onSave(configVales.chave, valor)}
          isSaving={isSaving(configVales.chave)}
          title="Dia de Vales e DAS"
          description="Dia padrão do mês para o pagamento de vales (adiantamento quinzenal) e tributos (Simples Nacional)."
          example="Ex: Se definido como 20, o adiantamento quinzenal e os tributos serão projetados para o dia 20."
          icon={Clock}
        />
      )}

      {configFeriado && (
        <MoneyConfigCard
          config={configFeriado}
          onSave={(valor) => onSave(configFeriado.chave, valor)}
          isSaving={isSaving(configFeriado.chave)}
        />
      )}

      {configConvenioLimite && (
        <PercentConfigCard
          config={configConvenioLimite}
          onSave={(valor) => onSave(configConvenioLimite.chave, valor)}
          isSaving={isSaving(configConvenioLimite.chave)}
        />
      )}
    </div>
  );
}

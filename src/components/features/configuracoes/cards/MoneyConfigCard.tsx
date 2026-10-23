import { useState, useEffect } from "react";
import { CircleDollarSign } from "lucide-react";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { BaseConfigCard } from "../BaseConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface MoneyConfigCardProps {
  config: ConfigItem;
  onSave: (value: string) => void;
  isSaving: boolean;
}

export function MoneyConfigCard({ config, onSave, isSaving }: MoneyConfigCardProps) {
  const [value, setValue] = useState(config.valor);

  useEffect(() => {
    setValue(config.valor);
  }, [config.valor]);

  const hasChanged = value !== config.valor;

  return (
    <BaseConfigCard
      title="Valor Fixo para Feriado"
      description="Valor adicional pago automaticamente como ocorrência extra quando uma atividade é aberta em dia de feriado."
      icon={CircleDollarSign}
      example="Ex: Se definido como 50, o colaborador ganhará R$ 50,00 adicionais no extrato se abrir turno num feriado."
      hasChanged={hasChanged}
      isSaving={isSaving}
      onSave={() => onSave(value)}
      unit="R$"
    >
      <MoneyInput
        value={Number(value || 0)}
        onChange={(val) => setValue(val.toString())}
        className="pr-12 text-sm font-medium"
      />
    </BaseConfigCard>
  );
}

import { useState, useEffect } from "react";
import { Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BaseConfigCard } from "../BaseConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface PercentConfigCardProps {
  config: ConfigItem;
  onSave: (value: string) => void;
  isSaving: boolean;
}

export function PercentConfigCard({ config, onSave, isSaving }: PercentConfigCardProps) {
  const [value, setValue] = useState(config.valor);

  useEffect(() => {
    setValue(config.valor);
  }, [config.valor]);

  const hasChanged = value !== config.valor;

  return (
    <BaseConfigCard
      title="Limite de Comprometimento com Convênios"
      description="Percentual máximo dos rendimentos do colaborador permitido para convênios e manutenções no mês. Ao atingir este teto, o sistema bloqueia novos lançamentos automaticamente."
      icon={Percent}
      example="Ex: Se definido como 30%, um colaborador com R$ 2.000,00 a receber terá um limite mensal de R$ 600,00 para manutenções e convênios."
      hasChanged={hasChanged}
      isSaving={isSaving}
      onSave={() => onSave(value)}
      unit="%"
    >
      <Input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-12 text-sm font-medium"
      />
    </BaseConfigCard>
  );
}

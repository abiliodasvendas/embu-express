import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { BaseConfigCard } from "../BaseConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface DayConfigCardProps {
  config: ConfigItem;
  title: string;
  description: string;
  example: string;
  icon: React.ComponentType<{ className?: string }>;
  onSave: (value: string) => void;
  isSaving: boolean;
}

export function DayConfigCard({
  config,
  title,
  description,
  example,
  icon,
  onSave,
  isSaving,
}: DayConfigCardProps) {
  const [value, setValue] = useState(config.valor);

  useEffect(() => {
    setValue(config.valor);
  }, [config.valor]);

  const hasChanged = value !== config.valor;
  const numValue = Number(value);
  const isValid = !isNaN(numValue) && numValue >= 1 && numValue <= 31 && Number.isInteger(numValue);

  return (
    <BaseConfigCard
      title={title}
      description={description}
      icon={icon}
      example={example}
      hasChanged={hasChanged}
      isSaving={isSaving}
      onSave={() => onSave(value)}
      disabled={!isValid}
      unit="Dia"
    >
      <Input
        type="number"
        min={1}
        max={31}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-12 text-sm font-medium"
      />
      {!isValid && (
        <p className="text-[11px] text-destructive font-medium ml-1 mt-1">
          Informe um dia válido entre 1 e 31.
        </p>
      )}
    </BaseConfigCard>
  );
}

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { BaseConfigCard } from "../BaseConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface MinutesConfigCardProps {
  config: ConfigItem;
  onSave: (value: string) => void;
  onChangeDraft?: (value: string) => void;
  isSaving: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  example?: string;
}

export function MinutesConfigCard({
  config,
  onSave,
  onChangeDraft,
  isSaving,
  title,
  description,
  icon,
  example,
}: MinutesConfigCardProps) {
  const [value, setValue] = useState(config.valor);

  useEffect(() => {
    setValue(config.valor);
    if (onChangeDraft) onChangeDraft(config.valor);
  }, [config.valor, onChangeDraft]);

  const hasChanged = value !== config.valor;

  const handleValueChange = (val: string) => {
    setValue(val);
    if (onChangeDraft) onChangeDraft(val);
  };

  return (
    <BaseConfigCard
      title={title}
      description={description}
      icon={icon}
      example={example}
      hasChanged={hasChanged}
      isSaving={isSaving}
      onSave={() => onSave(value)}
      unit="min"
    >
      <Input
        type="number"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        className="pr-12 text-sm font-medium"
      />
    </BaseConfigCard>
  );
}

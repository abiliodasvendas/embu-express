import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BaseConfigCard } from "../BaseConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface GeofencingConfigCardProps {
  config: ConfigItem;
  onSave: (value: string) => void;
  isSaving: boolean;
}

export function GeofencingConfigCard({ config, onSave, isSaving }: GeofencingConfigCardProps) {
  const [value, setValue] = useState(config.valor);
  const MIN_RECOMMENDED_METERS = 100;

  useEffect(() => {
    setValue(config.valor);
  }, [config.valor]);

  const hasChanged = value !== config.valor;
  const isBelowMinimum = Number(value || 0) < MIN_RECOMMENDED_METERS;

  return (
    <BaseConfigCard
      title="Distância máxima para registrar atividade"
      description="Distância máxima permitida entre o colaborador e a unidade para o registro de atividade ser autorizado."
      icon={MapPin}
      example="Ex: Se definido como 500, o colaborador deve estar num raio de 500 metros da unidade para conseguir iniciar o turno."
      hasChanged={hasChanged}
      isSaving={isSaving}
      onSave={() => onSave(value)}
      disabled={isBelowMinimum}
      unit="m"
    >
      <Input
        type="number"
        min={MIN_RECOMMENDED_METERS}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-12 text-sm font-medium"
      />
      {isBelowMinimum && (
        <p className="text-[11px] text-destructive font-medium ml-1 mt-1">
          Mínimo recomendado: {MIN_RECOMMENDED_METERS}m (para evitar erros de GPS)
        </p>
      )}
    </BaseConfigCard>
  );
}

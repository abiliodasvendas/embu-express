import { Clock, AlertTriangle } from "lucide-react";
import { ToleranceTimeline } from "@/components/admin/ToleranceTimeline";
import { MinutesConfigCard } from "../cards/MinutesConfigCard";
import { GeofencingConfigCard } from "../cards/GeofencingConfigCard";
import type { ConfigItem } from "@/hooks/ui/configuracoes";

interface JornadaTabProps {
  configAmarelo?: ConfigItem;
  configHeExcessiva?: ConfigItem;
  configGeofencing?: ConfigItem;
  onSave: (chave: string, valor: string) => void;
  isSaving: (chave: string) => boolean;
  onDraftChange: (chave: string, valor: string) => void;
  draftValues: Record<string, string>;
}

export function JornadaTab({
  configAmarelo,
  configHeExcessiva,
  configGeofencing,
  onSave,
  isSaving,
  onDraftChange,
  draftValues,
}: JornadaTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configAmarelo && (
          <MinutesConfigCard
            config={configAmarelo}
            onSave={(valor) => onSave(configAmarelo.chave, valor)}
            onChangeDraft={(valor) => onDraftChange(configAmarelo.chave, valor)}
            isSaving={isSaving(configAmarelo.chave)}
            title="Alerta de Atraso (Amarelo)"
            description="Limite superior para o status de 'Atenção'. Após este tempo, o atraso é considerado crítico (Vermelho)."
            icon={Clock}
            example="Ex: Se definido como 15 min, entradas de 6 a 15 min de atraso ficam amarelas. Acima disso, vermelhas."
          />
        )}

        {configHeExcessiva && (
          <MinutesConfigCard
            config={configHeExcessiva}
            onSave={(valor) => onSave(configHeExcessiva.chave, valor)}
            isSaving={isSaving(configHeExcessiva.chave)}
            title="Limite de Hora Extra Alerta"
            description="Define o tempo de jornada excedente que dispara um alerta de segurança/fadiga para a gerência."
            icon={AlertTriangle}
            example="Ex: Se definido como 120 min, o sistema avisa quando o colaborador trabalhar 2h além do seu horário."
          />
        )}

        {configGeofencing && (
          <GeofencingConfigCard
            config={configGeofencing}
            onSave={(valor) => onSave(configGeofencing.chave, valor)}
            isSaving={isSaving(configGeofencing.chave)}
          />
        )}
      </div>

      <ToleranceTimeline draftValues={draftValues} />
    </div>
  );
}

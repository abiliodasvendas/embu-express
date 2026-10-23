import React from "react";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Banner } from "@/components/ui/Banner";

interface BaseConfigCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  example?: string;
  hasChanged: boolean;
  isSaving: boolean;
  onSave: () => void;
  disabled?: boolean;
  unit?: string;
  children: React.ReactNode;
}

export function BaseConfigCard({
  title,
  description,
  icon: Icon,
  example,
  hasChanged,
  isSaving,
  onSave,
  disabled = false,
  unit,
  children,
}: BaseConfigCardProps) {
  const unitLabel =
    unit === "R$"
      ? "Reais"
      : unit === "m"
        ? "Metros"
        : unit === "%"
          ? "Porcentagem"
          : unit === "Dia"
            ? "Dia do Mês"
            : "Minutos";

  return (
    <Card className="rounded-3xl border-border bg-card shadow-xs hover:border-primary/30 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
          {description}
        </CardDescription>
        {example && (
          <Banner
            variant="neutral"
            description={example}
            className="py-2.5 px-3 text-xs"
          />
        )}
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Valor em {unitLabel}
          </Label>
          <div className="relative">
            {children}
            {unit && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-semibold text-xs uppercase tracking-wider select-none pointer-events-none">
                {unit}
              </div>
            )}
          </div>
        </div>

        <Button
          variant={hasChanged && !disabled ? "default" : "outline"}
          className="w-full h-11 rounded-[18px] font-semibold"
          onClick={() => hasChanged && !disabled && onSave()}
          disabled={!hasChanged || isSaving || disabled}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Clock className="animate-spin h-4 w-4" />
              <span>Salvando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>{hasChanged ? "Salvar Alteração" : "Sem Alterações"}</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

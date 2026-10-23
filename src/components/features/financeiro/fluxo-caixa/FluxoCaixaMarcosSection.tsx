interface FluxoCaixaMarcosSectionProps {
  diaSalariosStr: string;
  diaConveniosStr: string;
  diaValesStr: string;
}

export function FluxoCaixaMarcosSection({
  diaSalariosStr,
  diaConveniosStr,
  diaValesStr,
}: FluxoCaixaMarcosSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 bg-muted/30 border border-border rounded-[18px] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
          {diaSalariosStr}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight truncate">
            Desembolso de Salários
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
            Saldo Líquido da Folha Anterior
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-muted/30 border border-border rounded-[18px] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
          {diaConveniosStr}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight truncate">
            Desembolso Convênios
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
            Oficinas e Postos Parceiros
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-muted/30 border border-border rounded-[18px] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
          {diaValesStr}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight truncate">
            Vales + DAS
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
            Adiantamento Quinzenal e Simples
          </p>
        </div>
      </div>
    </div>
  );
}

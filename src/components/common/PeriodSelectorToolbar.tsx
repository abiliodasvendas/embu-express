import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FilterOptions } from "@/types/enums";
import { meses, anos } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PeriodSelectorToolbarProps {
    usuarioId?: string | null;
    collaborators?: any[];
    selectedMonth: number;
    selectedYear: number;
    selectedShift?: string;
    availableShifts?: (string | { id: string | number; label: string })[];
    onUsuarioChange?: (val: string) => void;
    onMonthChange: (val: number) => void;
    onYearChange: (val: number) => void;
    onShiftChange?: (val: string) => void;
    hideCollaboratorSelect?: boolean;
    hideShiftSelect?: boolean;
    title?: string;
}

export function PeriodSelectorToolbar({
    usuarioId,
    collaborators = [],
    selectedMonth,
    selectedYear,
    selectedShift,
    availableShifts = [],
    onUsuarioChange,
    onMonthChange,
    onYearChange,
    onShiftChange,
    hideCollaboratorSelect = false,
    hideShiftSelect = false,
    title = "Filtrar Período"
}: PeriodSelectorToolbarProps) {
    const isMobile = useIsMobile();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const activeFilterCount = [
        !hideShiftSelect && selectedShift && selectedShift !== FilterOptions.TODOS,
        selectedMonth !== (new Date().getMonth() + 1),
        selectedYear !== new Date().getFullYear()
    ].filter(Boolean).length;

    const FilterContent = ({ isSheet = false }) => (
        <div className={cn("flex flex-col gap-4", isSheet ? "px-6 pb-6" : "p-4")}>
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Mês</Label>
                <Select value={String(selectedMonth)} onValueChange={(v) => onMonthChange(Number(v))}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {meses.map((label, index) => (
                            <SelectItem key={index + 1} value={String(index + 1)} className="font-medium">{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Ano</Label>
                <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {anos.map(a => (
                            <SelectItem key={a.value} value={String(a.value)} className="font-medium">{a.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!hideShiftSelect && (
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">Turno</Label>
                    <Select value={selectedShift} onValueChange={onShiftChange}>
                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value={FilterOptions.TODOS} className="font-medium">Todos os turnos</SelectItem>
                            {availableShifts.map((s, idx) => {
                                const val = typeof s === 'string' ? s : String(s.id);
                                const label = typeof s === 'string' ? s : s.label;
                                return <SelectItem key={val || idx} value={val}>{label}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );

    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-visible">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                    {!hideCollaboratorSelect && (
                        <div className="flex-[2] w-full space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Colaborador</label>
                            <Combobox
                                options={[
                                    { value: FilterOptions.TODOS, label: "Selecionar Colaborador" },
                                    ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                                ]}
                                value={usuarioId || FilterOptions.TODOS}
                                onSelect={(val) => onUsuarioChange?.(val || FilterOptions.TODOS)}
                                placeholder="Selecionar Colaborador"
                                className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 hover:bg-white transition-all shadow-none"
                            />
                        </div>
                    )}

                    {!isMobile ? (
                        <>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Mês</label>
                                <Select value={String(selectedMonth)} onValueChange={(v) => onMonthChange(Number(v))}>
                                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {meses.map((label, index) => (
                                            <SelectItem key={index + 1} value={String(index + 1)}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Ano</label>
                                <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
                                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {anos.map(a => (
                                            <SelectItem key={a.value} value={String(a.value)}>{a.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!hideShiftSelect && (
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Turno</label>
                                    <Select value={selectedShift} onValueChange={onShiftChange}>
                                        <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-100 font-medium text-slate-700 shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value={FilterOptions.TODOS}>Todos os Turnos</SelectItem>
                                            {availableShifts.map((s, idx) => {
                                                const val = typeof s === 'string' ? s : String(s.id);
                                                const label = typeof s === 'string' ? s : s.label;
                                                return <SelectItem key={val || idx} value={val}>{label}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={cn("w-full", hideCollaboratorSelect && "order-first")}>
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                   <Button 
                                    variant="outline" 
                                    className="w-full h-12 rounded-xl border-gray-100 bg-gray-50 text-slate-600 font-bold gap-2 relative"
                                   >
                                       Filtros de Período
                                       {activeFilterCount > 0 && (
                                           <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                               {activeFilterCount}
                                           </span>
                                       )}
                                   </Button>
                                </SheetTrigger>
                                <SheetContent 
                                    side="bottom" 
                                    className="rounded-t-[32px] border-t-0 bg-white p-0 overflow-hidden"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                    <SheetHeader className="px-6 pt-6 pb-2 text-left">
                                        <SheetTitle className="text-xl font-black text-slate-800">{title}</SheetTitle>
                                        <SheetDescription>Ajuste o mês e turno para visualizar os dados.</SheetDescription>
                                    </SheetHeader>
                                    <FilterContent isSheet />
                                    <div className="p-4 border-t bg-slate-50">
                                        <Button 
                                            onClick={() => setIsSheetOpen(false)} 
                                            className="w-full h-12 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/10"
                                        >
                                            CONCLUÍDO
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

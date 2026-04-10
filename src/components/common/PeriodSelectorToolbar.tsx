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
    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-visible bg-transparent sm:bg-white">
            <CardContent className="p-0 sm:p-6">
                <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-3">
                    {!hideCollaboratorSelect && (
                        <div className="w-full md:flex-1 space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Clientes</label>
                            <Combobox
                                options={[
                                    { value: FilterOptions.TODOS, label: "Selecionar Colaborador" },
                                    ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                                ]}
                                value={usuarioId || FilterOptions.TODOS}
                                onSelect={(val) => onUsuarioChange?.(val || FilterOptions.TODOS)}
                                placeholder="Selecionar Colaborador"
                                className="h-12 md:h-11 rounded-xl bg-white border-gray-200 font-medium text-slate-700 hover:border-emerald-500 transition-all shadow-sm"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:contents gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Mês</label>
                            <Select value={String(selectedMonth)} onValueChange={(v) => onMonthChange(Number(v))}>
                                <SelectTrigger className="h-12 md:h-11 rounded-xl bg-white border-gray-200 font-medium text-slate-700 shadow-sm hover:border-emerald-500 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {meses.map((label, index) => (
                                        <SelectItem key={index + 1} value={String(index + 1)}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Ano</label>
                            <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
                                <SelectTrigger className="h-12 md:h-11 rounded-xl bg-white border-gray-200 font-medium text-slate-700 shadow-sm hover:border-emerald-500 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {anos.map(a => (
                                        <SelectItem key={a.value} value={String(a.value)}>{a.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!hideShiftSelect && (
                        <div className="w-full md:flex-1 space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Turno</label>
                            <Select 
                                value={selectedShift} 
                                onValueChange={onShiftChange} 
                                disabled={(usuarioId === FilterOptions.TODOS && !hideCollaboratorSelect) || availableShifts.length === 0}
                            >
                                <SelectTrigger className="h-12 md:h-11 rounded-xl bg-white border-gray-200 font-medium text-slate-700 shadow-sm hover:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <SelectValue placeholder={availableShifts.length === 0 ? "Nenhum turno" : "Selecionar..."} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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
            </CardContent>
        </Card>
    );
}

import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateFeriado, useDeleteFeriado, useFeriados, useLayout } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Trash2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const feriadoSchema = z.object({
    data: z.string().min(1, "Data é obrigatória"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
});

export default function Feriados() {
    const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } = useLayout();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: feriados, isLoading } = useFeriados(parseInt(selectedYear));
    const createFeriado = useCreateFeriado();
    const deleteFeriado = useDeleteFeriado();

    const form = useForm<z.infer<typeof feriadoSchema>>({
        resolver: zodResolver(feriadoSchema),
        defaultValues: { data: "", descricao: "" },
    });

    useEffect(() => {
        setPageTitle("Gestão de Feriados");
    }, [setPageTitle]);

    const onSubmit = async (values: z.infer<typeof feriadoSchema>) => {
        await createFeriado.mutateAsync(values as any);
        setIsAddOpen(false);
        form.reset();
    };

    const handleDelete = (id: number, desc: string) => {
        openConfirmationDialog({
            title: "Remover Feriado",
            description: `Deseja remover o feriado "${desc}"?`,
            confirmText: "Sim, remover",
            variant: "destructive",
            onConfirm: async () => {
                await deleteFeriado.mutateAsync(id);
                closeConfirmationDialog();
            },
        });
    };

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6">
                    <CardTitle className="text-xl font-bold text-gray-800">Feriados Cadastrados</CardTitle>
                    <div className="flex items-center gap-3">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px] rounded-xl">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl gap-2 font-bold shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    Novo Feriado
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Cadastrar Feriado</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="data"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Data</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="rounded-xl h-11" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="descricao"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descrição</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Natal" {...field} className="rounded-xl h-11" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={createFeriado.isPending} className="rounded-xl font-bold">
                                                {createFeriado.isPending ? "Salvando..." : "Salvar"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8">
                            <ListSkeleton />
                        </div>
                    ) : feriados && feriados.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[150px] font-bold text-gray-700">Data</TableHead>
                                    <TableHead className="font-bold text-gray-700">Descrição</TableHead>
                                    <TableHead className="w-[100px] text-right font-bold text-gray-700">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feriados.map((f: any) => (
                                    <TableRow key={f.id} className="hover:bg-gray-50/30 transition-colors">
                                        <TableCell className="font-medium text-blue-600">
                                            {new Date(f.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </TableCell>
                                        <TableCell className="text-gray-600 font-medium">{f.descricao}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(f.id, f.descricao)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12">
                            <UnifiedEmptyState
                                icon={Calendar}
                                title="Nenhum feriado encontrado"
                                description={`Não há feriados cadastrados para o ano de ${selectedYear}.`}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

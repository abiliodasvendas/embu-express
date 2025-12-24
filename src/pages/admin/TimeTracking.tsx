import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";

export default function TimeTracking() {
  const { setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Controle de Ponto");
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registros de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum registro encontrado para hoje.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

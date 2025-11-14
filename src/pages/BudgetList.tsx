import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Budget, UserRole } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, convertToUSD } from '@/lib/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BudgetListProps {
  currentRole: UserRole;
}

const BudgetList = ({ currentRole }: BudgetListProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    setBudgets(storage.getBudgets());
  };

  const handleApprove = (budget: Budget) => {
    const dailyTotal = budget.dailyExpenses.reduce(
      (sum, day) => sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
    );
    const generalTotal = budget.generalExpense.accommodation + budget.generalExpense.flights;
    const total = dailyTotal + generalTotal;
    const totalUSD = convertToUSD(total, budget.currency);

    storage.updateBudget(budget.id, {
      status: 'Aprobado',
      approvedBy: currentRole,
      approvedAt: new Date().toISOString(),
    });
    storage.addToUsedBudget(budget.area, totalUSD);
    
    loadBudgets();
    setSelectedBudget(null);
    
    toast({
      title: "Presupuesto aprobado",
      description: `El presupuesto para ${budget.area} ha sido aprobado`,
    });
  };

  const handleReject = (budget: Budget) => {
    storage.updateBudget(budget.id, {
      status: 'Descartado',
    });
    
    loadBudgets();
    setSelectedBudget(null);
    
    toast({
      title: "Presupuesto descartado",
      description: `El presupuesto para ${budget.area} ha sido descartado`,
      variant: "destructive",
    });
  };

  const calculateTotal = (budget: Budget) => {
    const dailyTotal = budget.dailyExpenses.reduce(
      (sum, day) => sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
    );
    const generalTotal = budget.generalExpense.accommodation + budget.generalExpense.flights;
    return dailyTotal + generalTotal;
  };

  const getStatusBadge = (status: Budget['status']) => {
    const variants: Record<Budget['status'], 'default' | 'outline' | 'destructive'> = {
      'Nuevo': 'default',
      'Aprobado': 'outline',
      'Descartado': 'destructive',
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredBudgets = budgets.filter(b => {
    if (currentRole === 'Aprobador') return b.status === 'Nuevo';
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Presupuestos de Viaje</h1>

      {filteredBudgets.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No hay presupuestos para mostrar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBudgets.map((budget) => {
            const total = calculateTotal(budget);
            const totalUSD = convertToUSD(total, budget.currency);

            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{budget.area}</h3>
                        {getStatusBadge(budget.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Solicitante</p>
                          <p className="font-medium text-foreground">{budget.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Destino</p>
                          <p className="font-medium text-foreground">{budget.country}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fechas</p>
                          <p className="font-medium text-foreground text-sm">
                            {format(new Date(budget.startDate), 'dd/MM/yyyy', { locale: es })} - {format(new Date(budget.endDate), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(total, budget.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ({formatCurrency(totalUSD, 'USD')})
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBudget(budget)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {currentRole === 'Aprobador' && budget.status === 'Nuevo' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success hover:text-success"
                            onClick={() => handleApprove(budget)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(budget)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedBudget} onOpenChange={() => setSelectedBudget(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Presupuesto</DialogTitle>
          </DialogHeader>
          
          {selectedBudget && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Área</Label>
                  <p className="font-medium">{selectedBudget.area}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedBudget.status)}</div>
                </div>
                <div>
                  <Label>Solicitante</Label>
                  <p className="font-medium">{selectedBudget.email}</p>
                </div>
                <div>
                  <Label>Destino</Label>
                  <p className="font-medium">{selectedBudget.country}</p>
                </div>
                <div>
                  <Label>Viajeros</Label>
                  <p className="font-medium">{selectedBudget.travelers.join(', ')}</p>
                </div>
                <div>
                  <Label>Moneda</Label>
                  <p className="font-medium">{selectedBudget.currency}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Gastos Diarios</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="space-y-4">
                    {selectedBudget.dailyExpenses.map((day) => (
                      <div key={day.id} className="border-b border-border last:border-b-0">
                        <div className="bg-muted px-4 py-2">
                          <p className="font-medium">{format(new Date(day.date), 'dd/MM/yyyy', { locale: es })}</p>
                        </div>
                        {day.expenses.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            Sin gastos registrados
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left px-4 py-2 text-sm font-medium">Tipo</th>
                                  <th className="text-left px-4 py-2 text-sm font-medium">Descripción</th>
                                  <th className="text-right px-4 py-2 text-sm font-medium">Monto</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {day.expenses.map((expense) => (
                                  <tr key={expense.id}>
                                    <td className="px-4 py-2 text-sm capitalize text-muted-foreground">{expense.category}</td>
                                    <td className="px-4 py-2 text-sm">{expense.description || 'Sin descripción'}</td>
                                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(expense.amount, selectedBudget.currency)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-muted/50">
                                  <td colSpan={2} className="px-4 py-2 text-sm font-medium">Total del día</td>
                                  <td className="px-4 py-2 text-right font-semibold">
                                    {formatCurrency(
                                      day.expenses.reduce((sum, exp) => sum + exp.amount, 0), 
                                      selectedBudget.currency
                                    )}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Gastos Generales</h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Alojamiento</Label>
                    <p className="font-medium">{formatCurrency(selectedBudget.generalExpense.accommodation, selectedBudget.currency)}</p>
                  </div>
                  <div>
                    <Label>Vuelos</Label>
                    <p className="font-medium">{formatCurrency(selectedBudget.generalExpense.flights, selectedBudget.currency)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(calculateTotal(selectedBudget), selectedBudget.currency)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(convertToUSD(calculateTotal(selectedBudget), selectedBudget.currency), 'USD')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground mb-1">{children}</p>
);

export default BudgetList;

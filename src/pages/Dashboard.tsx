import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { Budget, AreaBudget, Currency } from '@/types/budget';
import { convertToUSD, formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Building2, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [areaBudgets, setAreaBudgets] = useState<AreaBudget[]>([]);

  useEffect(() => {
    setBudgets(storage.getBudgets());
    setAreaBudgets(storage.getAreaBudgets());
  }, []);

  const calculateTotalByArea = (area: string) => {
    const areaBudgetsFiltered = budgets.filter(b => b.area === area && b.status === 'Aprobado');
    
    const totalInUSD = areaBudgetsFiltered.reduce((sum, budget) => {
      const dailyTotal = budget.dailyExpenses.reduce(
        (dSum, d) => dSum + d.lunch + d.transport + d.events, 0
      );
      const generalTotal = budget.generalExpense.accommodation + budget.generalExpense.flights;
      const total = dailyTotal + generalTotal;
      return sum + convertToUSD(total, budget.currency);
    }, 0);

    return totalInUSD;
  };

  const totalBudgets = budgets.length;
  const approvedBudgets = budgets.filter(b => b.status === 'Aprobado').length;
  const totalSpentUSD = budgets
    .filter(b => b.status === 'Aprobado')
    .reduce((sum, budget) => {
      const dailyTotal = budget.dailyExpenses.reduce(
        (dSum, d) => dSum + d.lunch + d.transport + d.events, 0
      );
      const generalTotal = budget.generalExpense.accommodation + budget.generalExpense.flights;
      const total = dailyTotal + generalTotal;
      return sum + convertToUSD(total, budget.currency);
    }, 0);

  const areaStats = areaBudgets.map(ab => ({
    ...ab,
    spent: calculateTotalByArea(ab.area),
    remaining: ab.totalBudget - calculateTotalByArea(ab.area),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard de Presupuestos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Presupuestos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalBudgets}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprobados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{approvedBudgets}</div>
            <p className="text-xs text-muted-foreground mt-1">Presupuestos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto Total (USD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpentUSD, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Presupuestos aprobados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Áreas Activas
            </CardTitle>
            <Building2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{areaBudgets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Con presupuesto asignado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen por Área</CardTitle>
        </CardHeader>
        <CardContent>
          {areaStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay áreas configuradas. El administrador debe asignar presupuestos.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Área</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Presupuesto Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Gastado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Disponible</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% Utilizado</th>
                  </tr>
                </thead>
                <tbody>
                  {areaStats.map((area) => {
                    const percentage = area.totalBudget > 0 
                      ? (area.spent / area.totalBudget) * 100 
                      : 0;
                    
                    return (
                      <tr key={area.area} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-foreground">{area.area}</td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {formatCurrency(area.totalBudget, 'USD')}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {formatCurrency(area.spent, 'USD')}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {formatCurrency(area.remaining, 'USD')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            percentage > 90 ? 'text-destructive' :
                            percentage > 70 ? 'text-warning' :
                            'text-success'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

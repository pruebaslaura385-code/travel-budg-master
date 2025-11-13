import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { AreaBudget } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { Plus, Edit2 } from 'lucide-react';

const AreaManagement = () => {
  const [areaBudgets, setAreaBudgets] = useState<AreaBudget[]>([]);
  const [newArea, setNewArea] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadAreaBudgets();
  }, []);

  const loadAreaBudgets = () => {
    setAreaBudgets(storage.getAreaBudgets());
  };

  const handleAddArea = () => {
    if (!newArea.trim() || !newBudget) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const budget = parseFloat(newBudget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Error",
        description: "El presupuesto debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    storage.updateAreaBudget(newArea.trim(), budget);
    setNewArea('');
    setNewBudget('');
    loadAreaBudgets();
    
    toast({
      title: "Área agregada",
      description: `Se asignó ${formatCurrency(budget, 'USD')} al área ${newArea}`,
    });
  };

  const handleUpdateArea = (area: string) => {
    if (!editBudget) {
      toast({
        title: "Error",
        description: "Ingrese un presupuesto válido",
        variant: "destructive",
      });
      return;
    }

    const budget = parseFloat(editBudget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Error",
        description: "El presupuesto debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    storage.updateAreaBudget(area, budget);
    setEditingArea(null);
    setEditBudget('');
    loadAreaBudgets();
    
    toast({
      title: "Presupuesto actualizado",
      description: `El área ${area} ahora tiene ${formatCurrency(budget, 'USD')}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Gestión de Áreas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nueva Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="area-name">Nombre del Área</Label>
                <Input
                  id="area-name"
                  placeholder="Ej: Marketing, Ventas, IT..."
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="area-budget">Presupuesto Total (USD)</Label>
                <Input
                  id="area-budget"
                  type="number"
                  placeholder="0.00"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>
              <Button onClick={handleAddArea} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Área
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Áreas Configuradas</CardTitle>
          </CardHeader>
          <CardContent>
            {areaBudgets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay áreas configuradas aún
              </p>
            ) : (
              <div className="space-y-3">
                {areaBudgets.map((area) => (
                  <div
                    key={area.area}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{area.area}</h3>
                      {editingArea === area.area ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="number"
                            placeholder="Nuevo presupuesto"
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateArea(area.area)}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingArea(null);
                              setEditBudget('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Total: <span className="font-medium text-foreground">
                              {formatCurrency(area.totalBudget, 'USD')}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Usado: <span className="font-medium text-foreground">
                              {formatCurrency(area.usedBudget, 'USD')}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    {editingArea !== area.area && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingArea(area.area);
                          setEditBudget(area.totalBudget.toString());
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AreaManagement;

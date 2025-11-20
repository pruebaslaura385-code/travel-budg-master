import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { Plus, Edit2, Loader2 } from 'lucide-react';

interface Area {
  id: string;
  name: string;
  total_budget: number;
  used_budget: number;
}

const AreaManagement = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [newArea, setNewArea] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error loading areas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las áreas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
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

    setSaving(true);
    try {
      const { error } = await supabase
        .from('areas')
        .insert({
          name: newArea.trim(),
          total_budget: budget,
          used_budget: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "Ya existe un área con ese nombre",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setNewArea('');
      setNewBudget('');
      loadAreas();
      
      toast({
        title: "Área agregada",
        description: `Se asignó ${formatCurrency(budget, 'USD')} al área ${newArea}`,
      });
    } catch (error) {
      console.error('Error adding area:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el área",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateArea = async (areaId: string, areaName: string) => {
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

    setSaving(true);
    try {
      const { error } = await supabase
        .from('areas')
        .update({ total_budget: budget })
        .eq('id', areaId);

      if (error) throw error;

      setEditingArea(null);
      setEditBudget('');
      loadAreas();
      
      toast({
        title: "Presupuesto actualizado",
        description: `El área ${areaName} ahora tiene ${formatCurrency(budget, 'USD')}`,
      });
    } catch (error) {
      console.error('Error updating area:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el área",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
              <Button onClick={handleAddArea} className="w-full" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
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
            {areas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay áreas configuradas aún
              </p>
            ) : (
              <div className="space-y-3">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{area.name}</h3>
                      {editingArea === area.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="number"
                            placeholder="Nuevo presupuesto"
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            className="flex-1"
                            disabled={saving}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateArea(area.id, area.name)}
                            disabled={saving}
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingArea(null);
                              setEditBudget('');
                            }}
                            disabled={saving}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Total: <span className="font-medium text-foreground">
                              {formatCurrency(area.total_budget, 'USD')}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Usado: <span className="font-medium text-foreground">
                              {formatCurrency(area.used_budget, 'USD')}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    {editingArea !== area.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingArea(area.id);
                          setEditBudget(area.total_budget.toString());
                        }}
                        disabled={saving}
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

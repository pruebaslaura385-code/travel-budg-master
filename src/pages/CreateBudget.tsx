import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Currency, Country, DailyExpense, Budget } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { eachDayOfInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';

const CreateBudget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [areas, setAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    area: '',
    email: '',
    startDate: '',
    endDate: '',
    country: '' as Country,
    currency: 'USD' as Currency,
  });
  
  const [travelers, setTravelers] = useState<string[]>(['']);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [generalExpense, setGeneralExpense] = useState({
    accommodation: 0,
    flights: 0,
  });

  useEffect(() => {
    const areaBudgets = storage.getAreaBudgets();
    setAreas(areaBudgets.map(ab => ab.area));
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start <= end) {
        const days = eachDayOfInterval({ start, end });
        const newDailyExpenses: DailyExpense[] = days.map((date, index) => ({
          id: `day-${index}`,
          date: date.toISOString().split('T')[0],
          lunch: 0,
          transport: 0,
          events: 0,
        }));
        setDailyExpenses(newDailyExpenses);
      }
    }
  }, [formData.startDate, formData.endDate]);

  const addTraveler = () => {
    setTravelers([...travelers, '']);
  };

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== index));
    }
  };

  const updateTraveler = (index: number, value: string) => {
    const newTravelers = [...travelers];
    newTravelers[index] = value;
    setTravelers(newTravelers);
  };

  const updateDailyExpense = (id: string, field: keyof Omit<DailyExpense, 'id' | 'date'>, value: number) => {
    setDailyExpenses(dailyExpenses.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.area || !formData.email || !formData.startDate || !formData.endDate || !formData.country) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (travelers.filter(t => t.trim()).length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un viajero",
        variant: "destructive",
      });
      return;
    }

    const budget: Budget = {
      id: Date.now().toString(),
      area: formData.area,
      email: formData.email,
      startDate: formData.startDate,
      endDate: formData.endDate,
      country: formData.country,
      travelers: travelers.filter(t => t.trim()),
      currency: formData.currency,
      dailyExpenses,
      generalExpense,
      status: 'Nuevo',
      createdAt: new Date().toISOString(),
    };

    storage.addBudget(budget);

    toast({
      title: "Presupuesto creado",
      description: "El presupuesto ha sido enviado para aprobación",
    });

    navigate('/presupuestos');
  };

  const currencies: Currency[] = ['USD', 'ARS', 'COP', 'BRL', 'EUR'];
  const countries: Country[] = ['Argentina', 'Colombia', 'Brasil', 'España', 'EE. UU.'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Crear Presupuesto de Viaje</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Área *</Label>
                <Select value={formData.area} onValueChange={(value) => setFormData({...formData, area: value})}>
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Seleccione un área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email del Solicitante *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="country">Filial/Destino *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value as Country})}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Seleccione un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Moneda *</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value as Currency})}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Viajeros</span>
              <Button type="button" size="sm" onClick={addTraveler}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {travelers.map((traveler, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Nombre del viajero"
                  value={traveler}
                  onChange={(e) => updateTraveler(index, e.target.value)}
                />
                {travelers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTraveler(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {dailyExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gastos Diarios ({dailyExpenses.length} días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium">Fecha</th>
                      <th className="text-right py-3 px-2 text-sm font-medium">Almuerzos</th>
                      <th className="text-right py-3 px-2 text-sm font-medium">Transporte</th>
                      <th className="text-right py-3 px-2 text-sm font-medium">Eventos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-border">
                        <td className="py-3 px-2 font-medium">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={expense.lunch || ''}
                            onChange={(e) => updateDailyExpense(expense.id, 'lunch', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={expense.transport || ''}
                            onChange={(e) => updateDailyExpense(expense.id, 'transport', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={expense.events || ''}
                            onChange={(e) => updateDailyExpense(expense.id, 'events', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Gastos Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accommodation">Alojamiento</Label>
                <Input
                  id="accommodation"
                  type="number"
                  min="0"
                  step="0.01"
                  value={generalExpense.accommodation || ''}
                  onChange={(e) => setGeneralExpense({...generalExpense, accommodation: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="flights">Vuelos</Label>
                <Input
                  id="flights"
                  type="number"
                  min="0"
                  step="0.01"
                  value={generalExpense.flights || ''}
                  onChange={(e) => setGeneralExpense({...generalExpense, flights: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/presupuestos')}>
            Cancelar
          </Button>
          <Button type="submit">
            Crear Presupuesto
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBudget;

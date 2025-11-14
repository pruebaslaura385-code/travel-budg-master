import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import { Currency, Country, DailyExpense, Budget, ExpenseItem, ExpenseCategory } from '@/types/budget';
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
          expenses: [],
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

  const addExpenseToDay = (dayId: string) => {
    setDailyExpenses(dailyExpenses.map(day => 
      day.id === dayId 
        ? { 
            ...day, 
            expenses: [...day.expenses, { 
              id: `${dayId}-exp-${Date.now()}`,
              category: 'comida' as ExpenseCategory,
              description: '', 
              amount: 0 
            }] 
          }
        : day
    ));
  };

  const removeExpenseFromDay = (dayId: string, expenseId: string) => {
    setDailyExpenses(dailyExpenses.map(day => 
      day.id === dayId 
        ? { ...day, expenses: day.expenses.filter(exp => exp.id !== expenseId) }
        : day
    ));
  };

  const updateExpense = (dayId: string, expenseId: string, field: keyof Omit<ExpenseItem, 'id'>, value: string | number | ExpenseCategory) => {
    setDailyExpenses(dailyExpenses.map(day => 
      day.id === dayId 
        ? {
            ...day,
            expenses: day.expenses.map(exp => 
              exp.id === expenseId ? { ...exp, [field]: value } : exp
            )
          }
        : day
    ));
  };

  const expenseCategories: { value: ExpenseCategory; label: string }[] = [
    { value: 'alojamiento', label: 'Alojamiento' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'comida', label: 'Comida' },
    { value: 'otros', label: 'Otros Gastos' },
  ];

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
                    {areas.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay áreas disponibles. El administrador debe configurarlas.
                      </div>
                    ) : (
                      areas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))
                    )}
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
            <CardContent className="space-y-6">
              {dailyExpenses.map((day) => (
                <div key={day.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      {format(new Date(day.date), "EEEE dd 'de' MMMM", { locale: es })}
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addExpenseToDay(day.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Gasto
                    </Button>
                  </div>

                  {day.expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay gastos agregados para este día
                    </p>
                  ) : (
                    <div className="border border-border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 text-sm font-medium text-foreground">Tipo</th>
                            <th className="text-left p-2 text-sm font-medium text-foreground">Descripción</th>
                            <th className="text-left p-2 text-sm font-medium text-foreground w-32">Monto</th>
                            <th className="w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.expenses.map((expense) => (
                            <tr key={expense.id} className="border-t border-border">
                              <td className="p-2">
                                <Select
                                  value={expense.category}
                                  onValueChange={(value) => updateExpense(day.id, expense.id, 'category', value as ExpenseCategory)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {expenseCategories.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Input
                                  placeholder="Descripción del gasto"
                                  value={expense.description}
                                  onChange={(e) => updateExpense(day.id, expense.id, 'description', e.target.value)}
                                  className="h-9"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={expense.amount || ''}
                                  onChange={(e) => updateExpense(day.id, expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="h-9"
                                />
                              </td>
                              <td className="p-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => removeExpenseFromDay(day.id, expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total del día:</span>
                      <span className="font-semibold text-foreground">
                        {formData.currency} {day.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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

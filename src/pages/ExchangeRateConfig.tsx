import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Currency } from '@/types/budget';
import { Loader2 } from 'lucide-react';

interface ExchangeRateConfig {
  id: string;
  currency_code: Currency;
  api_url: string;
}

const ExchangeRateConfig = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ExchangeRateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currencies: Currency[] = ['ARS', 'COP', 'BRL', 'EUR', 'USD'];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rate_config')
        .select('*');

      if (error) throw error;

      setConfigs((data || []) as ExchangeRateConfig[]);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (currency: Currency, url: string) => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'La URL no puede estar vacía',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const existingConfig = configs.find(c => c.currency_code === currency);

      if (existingConfig) {
        const { error } = await supabase
          .from('exchange_rate_config')
          .update({ api_url: url })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exchange_rate_config')
          .insert({ currency_code: currency, api_url: url });

        if (error) throw error;
      }

      toast({
        title: 'Guardado',
        description: `URL para ${currency} guardada correctamente`,
      });

      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getUrlForCurrency = (currency: Currency): string => {
    return configs.find(c => c.currency_code === currency)?.api_url || '';
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
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Configuración de Cotizaciones
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>URLs de APIs de Cotización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground mb-4">
            Configure las URLs de las APIs que devuelven las cotizaciones para cada moneda.
            La API debe devolver un JSON con la cotización respecto al USD.
          </p>

          {currencies.map((currency) => (
            <div key={currency} className="space-y-2">
              <Label htmlFor={`url-${currency}`}>
                URL para {currency}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`url-${currency}`}
                  type="url"
                  placeholder="https://api.example.com/rate/ARS"
                  defaultValue={getUrlForCurrency(currency)}
                  onBlur={(e) => {
                    if (e.target.value !== getUrlForCurrency(currency)) {
                      handleSave(currency, e.target.value);
                    }
                  }}
                  disabled={saving}
                />
                <Button
                  onClick={(e) => {
                    const input = document.getElementById(`url-${currency}`) as HTMLInputElement;
                    handleSave(currency, input.value);
                  }}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Formato esperado de la API:</p>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`{
  "rate": 1000.50
}`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Donde "rate" es el valor de 1 USD en la moneda consultada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateConfig;

-- Create table for exchange rate API configuration
CREATE TABLE IF NOT EXISTS public.exchange_rate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code TEXT NOT NULL UNIQUE,
  api_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exchange_rate_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read exchange rate configurations
CREATE POLICY "Anyone can view exchange rate config"
  ON public.exchange_rate_config
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete exchange rate configurations
CREATE POLICY "Admins can manage exchange rate config"
  ON public.exchange_rate_config
  FOR ALL
  USING (has_role(auth.uid(), 'Administrador'::app_role))
  WITH CHECK (has_role(auth.uid(), 'Administrador'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_exchange_rate_config_updated_at
  BEFORE UPDATE ON public.exchange_rate_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
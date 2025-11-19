-- Create budgets table to store all budget requests
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  country TEXT NOT NULL,
  travelers JSONB NOT NULL DEFAULT '[]',
  currency TEXT NOT NULL,
  daily_expenses JSONB NOT NULL DEFAULT '[]',
  general_expense JSONB NOT NULL DEFAULT '{}',
  corporate_cards JSONB NOT NULL DEFAULT '[]',
  exchange_rates JSONB NOT NULL DEFAULT '{}',
  actual_expense JSONB,
  status TEXT NOT NULL DEFAULT 'Nuevo',
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Solicitantes can view only their own budgets
CREATE POLICY "Solicitantes can view own budgets"
ON public.budgets
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'Administrador'::app_role)
  OR has_role(auth.uid(), 'Contador'::app_role)
);

-- Solicitantes can create their own budgets
CREATE POLICY "Solicitantes can create budgets"
ON public.budgets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only Admins and Contadores can update budgets
CREATE POLICY "Admins and Contadores can update budgets"
ON public.budgets
FOR UPDATE
USING (
  has_role(auth.uid(), 'Administrador'::app_role)
  OR has_role(auth.uid(), 'Contador'::app_role)
);

-- Only Admins can delete budgets
CREATE POLICY "Admins can delete budgets"
ON public.budgets
FOR DELETE
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- Create index for faster queries
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_status ON public.budgets(status);

-- Trigger to update updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
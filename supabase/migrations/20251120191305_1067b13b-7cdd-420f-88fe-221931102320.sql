-- Create areas table
CREATE TABLE public.areas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  total_budget numeric NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
  used_budget numeric NOT NULL DEFAULT 0 CHECK (used_budget >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view areas"
ON public.areas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage areas"
ON public.areas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'Administrador'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'Administrador'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_areas_updated_at
BEFORE UPDATE ON public.areas
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index
CREATE INDEX idx_areas_name ON public.areas(name);
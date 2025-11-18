-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_exists BOOLEAN;
  assigned_role app_role;
BEGIN
  -- Check if user email ends with allowed domain
  IF NEW.email NOT LIKE '%@miempresa.com' THEN
    RAISE EXCEPTION 'Acceso restringido a personal autorizado';
  END IF;

  -- Create profile for the user
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Check if there's already an admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'Administrador'
  ) INTO admin_exists;

  -- Assign role based on whether admin exists
  IF admin_exists THEN
    assigned_role := 'Solicitante';
  ELSE
    assigned_role := 'Administrador';
  END IF;

  -- Insert role for the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users without profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  ur.user_id,
  au.email,
  au.raw_user_meta_data->>'full_name'
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = ur.user_id
);
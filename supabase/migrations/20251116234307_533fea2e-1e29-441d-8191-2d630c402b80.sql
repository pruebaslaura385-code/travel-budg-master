-- Remove the old trigger that assigns default role
-- The edge function will now handle role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const ALLOWED_DOMAIN = '@miempresa.com';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const { type, user } = payload;

    // Only process user creation events
    if (type !== 'INSERT' || !user) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = user.email;

    // Check if email ends with allowed domain
    if (!email || !email.endsWith(ALLOWED_DOMAIN)) {
      console.error(`Unauthorized domain: ${email}`);
      
      // Delete the user since they're not authorized
      await supabase.auth.admin.deleteUser(user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'Acceso restringido a personal autorizado',
          message: `Solo se permite acceso a usuarios con dominio ${ALLOWED_DOMAIN}`
        }), 
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if there's already an admin
    const { data: existingAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'Administrador')
      .limit(1);

    // Assign role based on whether admin exists
    const roleToAssign = existingAdmins && existingAdmins.length > 0 
      ? 'Solicitante' 
      : 'Administrador';

    // Insert role for the new user
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: user.id, 
        role: roleToAssign 
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Error al asignar rol' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    console.log(`User ${email} created with role: ${roleToAssign}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        role: roleToAssign 
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in handle-auth function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

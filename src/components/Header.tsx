import { UserRole } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plane } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole | null;
}

const Header = ({ currentRole }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    if (!role) return 'Cargando...';
    return role;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gestor de Presupuestos</h1>
              <p className="text-sm text-muted-foreground">Control de Viajes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-muted-foreground">Perfil actual:</span>
              <span className="text-sm font-semibold text-foreground">{getRoleLabel(currentRole)}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

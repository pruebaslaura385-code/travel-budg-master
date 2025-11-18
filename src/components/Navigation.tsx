import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, PlusCircle, Settings, Users, DollarSign } from 'lucide-react';
import { UserRole } from '@/types/budget';

interface NavigationProps {
  currentRole: UserRole;
}

const Navigation = ({ currentRole }: NavigationProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Contador'] },
    { path: '/presupuestos', label: 'Presupuestos', icon: FileText, roles: ['Solicitante', 'Administrador', 'Contador'] },
    { path: '/crear', label: 'Crear Presupuesto', icon: PlusCircle, roles: ['Solicitante'] },
    { path: '/admin/areas', label: 'Gestión de Áreas', icon: Settings, roles: ['Administrador'] },
    { path: '/admin/users', label: 'Gestión de Usuarios', icon: Users, roles: ['Administrador'] },
    { path: '/admin/exchange-rates', label: 'Cotizaciones', icon: DollarSign, roles: ['Administrador'] },
  ];

  const visibleItems = navItems.filter(item => 
    item.roles.includes(currentRole)
  );

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  isActive
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import { UserRole } from '@/types/budget';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plane } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Header = ({ currentRole, onRoleChange }: HeaderProps) => {
  const roles: UserRole[] = ['Solicitante', 'Aprobador', 'Contador', 'Administrador'];

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
          
          <div className="flex items-center gap-3">
            <label htmlFor="role-select" className="text-sm font-medium text-muted-foreground">
              Perfil actual:
            </label>
            <Select value={currentRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
              <SelectTrigger id="role-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/pages/Dashboard';
import BudgetList from '@/pages/BudgetList';
import CreateBudget from '@/pages/CreateBudget';
import AreaManagement from '@/pages/AreaManagement';
import Auth from '@/pages/Auth';
import UserManagement from '@/pages/UserManagement';
import ExchangeRateConfig from '@/pages/ExchangeRateConfig';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const { role, loading, userId } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header currentRole={role} />
            <Navigation currentRole={role!} />
            <Routes>
              <Route 
                path="/" 
                element={
                  role === 'Solicitante' ? 
                    <Navigate to="/presupuestos" replace /> : 
                    <Dashboard />
                } 
              />
              <Route path="/presupuestos" element={<BudgetList currentRole={role!} />} />
              <Route path="/crear" element={<CreateBudget />} />
              <Route path="/areas" element={<AreaManagement />} />
              <Route path="/usuarios" element={<UserManagement />} />
              <Route path="/cotizaciones" element={<ExchangeRateConfig />} />
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

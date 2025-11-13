import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@/types/budget';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/pages/Dashboard';
import BudgetList from '@/pages/BudgetList';
import CreateBudget from '@/pages/CreateBudget';
import AreaManagement from '@/pages/AreaManagement';

const queryClient = new QueryClient();

const App = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Solicitante');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
            <Navigation currentRole={currentRole} />
            <Routes>
              <Route 
                path="/" 
                element={
                  currentRole === 'Solicitante' ? 
                    <Navigate to="/presupuestos" replace /> : 
                    <Dashboard />
                } 
              />
              <Route path="/presupuestos" element={<BudgetList currentRole={currentRole} />} />
              <Route path="/crear" element={<CreateBudget />} />
              <Route path="/areas" element={<AreaManagement />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

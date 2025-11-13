import { Budget, AreaBudget } from '@/types/budget';

const BUDGETS_KEY = 'travel_budgets';
const AREA_BUDGETS_KEY = 'area_budgets';

export const storage = {
  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(BUDGETS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  },

  addBudget: (budget: Budget) => {
    const budgets = storage.getBudgets();
    budgets.push(budget);
    storage.saveBudgets(budgets);
  },

  updateBudget: (id: string, updates: Partial<Budget>) => {
    const budgets = storage.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      storage.saveBudgets(budgets);
    }
  },

  getAreaBudgets: (): AreaBudget[] => {
    const data = localStorage.getItem(AREA_BUDGETS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAreaBudgets: (areaBudgets: AreaBudget[]) => {
    localStorage.setItem(AREA_BUDGETS_KEY, JSON.stringify(areaBudgets));
  },

  updateAreaBudget: (area: string, totalBudget: number) => {
    const areaBudgets = storage.getAreaBudgets();
    const index = areaBudgets.findIndex(ab => ab.area === area);
    
    if (index !== -1) {
      areaBudgets[index].totalBudget = totalBudget;
    } else {
      areaBudgets.push({ area, totalBudget, usedBudget: 0 });
    }
    
    storage.saveAreaBudgets(areaBudgets);
  },

  addToUsedBudget: (area: string, amount: number) => {
    const areaBudgets = storage.getAreaBudgets();
    const index = areaBudgets.findIndex(ab => ab.area === area);
    
    if (index !== -1) {
      areaBudgets[index].usedBudget += amount;
    } else {
      areaBudgets.push({ area, totalBudget: 0, usedBudget: amount });
    }
    
    storage.saveAreaBudgets(areaBudgets);
  },
};

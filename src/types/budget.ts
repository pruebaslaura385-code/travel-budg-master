export type Currency = 'ARS' | 'COP' | 'BRL' | 'EUR' | 'USD';
export type BudgetStatus = 'Nuevo' | 'Aprobado' | 'Descartado';
export type UserRole = 'Solicitante' | 'Aprobador' | 'Contador' | 'Administrador';
export type Country = 'Argentina' | 'Colombia' | 'Brasil' | 'España' | 'EE. UU.';

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ARS: 1000,
  COP: 4000,
  BRL: 5,
  EUR: 0.92,
};

export interface DailyExpense {
  id: string;
  date: string;
  lunch: number;
  transport: number;
  events: number;
}

export interface GeneralExpense {
  accommodation: number;
  flights: number;
}

export interface ActualExpense {
  dailyExpenses: DailyExpense[];
  generalExpense: GeneralExpense;
}

export interface Budget {
  id: string;
  area: string;
  email: string;
  startDate: string;
  endDate: string;
  country: Country;
  travelers: string[];
  currency: Currency;
  dailyExpenses: DailyExpense[];
  generalExpense: GeneralExpense;
  actualExpense?: ActualExpense;
  status: BudgetStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AreaBudget {
  area: string;
  totalBudget: number;
  usedBudget: number;
}

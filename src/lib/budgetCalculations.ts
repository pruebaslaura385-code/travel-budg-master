import { Budget, Currency } from '@/types/budget';

export const calculateBudgetTotal = (budget: Budget): number => {
  const dailyTotal = budget.dailyExpenses.reduce(
    (sum, day) => sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
  );
  const generalTotal = budget.generalExpense.accommodation + budget.generalExpense.flights;
  const corporateCardsTotal = (budget.corporateCards || []).reduce((sum, card) => sum + card.amount, 0);
  return dailyTotal + generalTotal + corporateCardsTotal;
};

export const convertToUSDWithBudgetRates = (amount: number, currency: Currency, budget: Budget): number => {
  if (currency === 'USD') return amount;
  
  // Use the exchange rates that were saved with the budget
  if (budget.exchangeRates && budget.exchangeRates[currency]) {
    return amount / budget.exchangeRates[currency];
  }
  
  // Fallback to static rates if budget rates are not available
  const { EXCHANGE_RATES } = require('@/types/budget');
  return amount / EXCHANGE_RATES[currency];
};

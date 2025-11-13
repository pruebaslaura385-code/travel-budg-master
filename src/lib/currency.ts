import { Currency, EXCHANGE_RATES } from '@/types/budget';

export const convertToUSD = (amount: number, currency: Currency): number => {
  return amount / EXCHANGE_RATES[currency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    ARS: '$',
    COP: '$',
    BRL: 'R$',
    EUR: '€',
  };
  
  return `${symbols[currency]}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

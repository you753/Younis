import { useAppStore } from '@/lib/store';
import { formatCurrency, getCurrency, parseCurrency } from '@/lib/currency';

export function useCurrency() {
  const { settings } = useAppStore();
  const currentCurrency = settings.currency || 'SAR';
  
  const format = (amount: number | string) => {
    return formatCurrency(amount, currentCurrency);
  };
  
  const parse = (value: string) => {
    return parseCurrency(value);
  };
  
  const currency = getCurrency(currentCurrency);
  
  return {
    currency,
    format,
    parse,
    code: currentCurrency,
    symbol: currency.symbol
  };
}
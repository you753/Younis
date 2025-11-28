export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameAr: string;
  decimalPlaces: number;
}

export const CURRENCIES: Currency[] = [
  {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    decimalPlaces: 2
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي',
    decimalPlaces: 2
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameAr: 'يورو',
    decimalPlaces: 2
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    nameAr: 'درهم إماراتي',
    decimalPlaces: 2
  },
  {
    code: 'KWD',
    symbol: 'د.ك',
    name: 'Kuwaiti Dinar',
    nameAr: 'دينار كويتي',
    decimalPlaces: 3
  },
  {
    code: 'QAR',
    symbol: 'ر.ق',
    name: 'Qatari Riyal',
    nameAr: 'ريال قطري',
    decimalPlaces: 2
  },
  {
    code: 'BHD',
    symbol: 'د.ب',
    name: 'Bahraini Dinar',
    nameAr: 'دينار بحريني',
    decimalPlaces: 3
  },
  {
    code: 'OMR',
    symbol: 'ر.ع',
    name: 'Omani Rial',
    nameAr: 'ريال عماني',
    decimalPlaces: 3
  },
  {
    code: 'EGP',
    symbol: 'ج.م',
    name: 'Egyptian Pound',
    nameAr: 'جنيه مصري',
    decimalPlaces: 2
  },
  {
    code: 'JOD',
    symbol: 'د.أ',
    name: 'Jordanian Dinar',
    nameAr: 'دينار أردني',
    decimalPlaces: 3
  }
];

export function getCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(amount: number | string, currencyCode: string = 'SAR'): string {
  const currency = getCurrency(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `0 ${currency.symbol}`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  }).format(numAmount) + ` ${currency.symbol}`;
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and Arabic numerals, keep only digits and decimal point
  const cleanValue = value
    .replace(/[^\d.,\-]/g, '')
    .replace(',', '.');
  
  return parseFloat(cleanValue) || 0;
}

export function getCurrencyOptions() {
  return CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.nameAr} (${currency.code})`,
    symbol: currency.symbol
  }));
}
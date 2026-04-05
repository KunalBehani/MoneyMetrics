import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRates } from '../services/api';
import { formatCurrency } from '../utils/currencyFormatter';

export const useCurrency = (initialCurrency = 'INR') => {
  const [currency, setCurrency] = useState(initialCurrency);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const loadRates = async () => {
      const data = await fetchExchangeRates('INR'); // Base is always INR
      if (data) setRates(data);
    };
    loadRates();
  }, []);

  const convertAndFormat = useCallback((amount) => {
    if (currency === 'INR' || !rates) {
      return formatCurrency(amount, 'INR', 'en-IN');
    }
    const convertedAmount = amount * (rates[currency] || 1);
    const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'en-DE' : 'en-IN';
    return formatCurrency(convertedAmount, currency, locale);
  }, [currency, rates]);

  return { currency, setCurrency, format: convertAndFormat, rates };
};

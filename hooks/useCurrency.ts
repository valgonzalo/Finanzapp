import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CURRENCIES } from '@/lib/constants';
import { formatAmount as baseFormatAmount } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

const RATES_CACHE_KEY = 'finanzapp_rates_cache';
const RATES_EXPIRY = 1000 * 60 * 60; // 1 hour

export function useCurrency() {
  const settings = useLiveQuery(() => db.settings.toArray());
  const userSettings = settings?.[0];
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Try to get from cache first
        const cache = localStorage.getItem(RATES_CACHE_KEY);
        if (cache) {
          const { data, timestamp } = JSON.parse(cache);
          if (Date.now() - timestamp < RATES_EXPIRY) {
            setRates(data);
            return;
          }
        }

        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const json = await res.json();
        if (json.rates) {
          setRates(json.rates);
          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
            data: json.rates,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    fetchRates();
  }, []);

  const currencyInfo = useMemo(() => {
    if (!userSettings?.currency) return CURRENCIES[0];
    return CURRENCIES.find(c => c.id === userSettings.currency) || CURRENCIES[0];
  }, [userSettings?.currency]);

  // We assume the stored values are in ARS if no base is defined, 
  // or we can use a fixed base for the internal DB values.
  // For simplicity, let's assume DB values are ALWAYS in ARS (legacy) 
  // or the user's first choice.
  const convert = (amount: number, to: string) => {
    if (!rates['ARS'] || !rates[to]) return amount;
    // value_in_usd = amount / rates['ARS']
    // value_in_target = value_in_usd * rates[to]
    const valInUsd = amount / rates['ARS'];
    return valInUsd * rates[to];
  };

  const formatCurrency = (amount: number) => {
    const converted = convert(amount, currencyInfo.id);
    return `${currencyInfo.symbol} ${baseFormatAmount(converted, currencyInfo.code)}`;
  };

  const formatAmount = (amount: number) => {
    const converted = convert(amount, currencyInfo.id);
    return baseFormatAmount(converted, currencyInfo.code);
  };

  return {
    symbol: currencyInfo.symbol,
    code: currencyInfo.code,
    formatCurrency,
    formatAmount,
    currencyId: currencyInfo.id,
    rates
  };
}

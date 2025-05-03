"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

export interface CurrencyRate {
  [key: string]: number;
}

interface CurrencyContextType {
  currencyRates: CurrencyRate;
  loading: boolean;
  error: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyRates: { USD: 3000, MYR: 14000 },
  loading: false,
  error: false,
  refreshRates: async () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate>({
    USD: 3000,
    MYR: 14000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,myr"
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCurrencyRates({
        USD: data.ethereum.usd,
        MYR: data.ethereum.myr,
      });
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
      setError(true);
      // Keep using the fallback rates
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currencyRates,
        loading,
        error,
        refreshRates: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

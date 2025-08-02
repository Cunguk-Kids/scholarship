import { createContext, useEffect, useState, type ReactNode } from 'react';

export type TokenRateContextType = {
  rate: number | null;
  loading: boolean;
  error: Error | null;
};

// eslint-disable-next-line react-refresh/only-export-components
export const TokenRateContext = createContext<TokenRateContextType | undefined>(undefined);

type TokenRateProviderProps = {
  children: ReactNode;
};

export function TokenRateProvider({ children }: TokenRateProviderProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr',
        );
        const data = await res.json();
        console.log(data, '-----data-----');

        setRate(data?.['usd-coin'].idr);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  return (
    <TokenRateContext.Provider value={{ rate, loading, error }}>
      {children}
    </TokenRateContext.Provider>
  );
}

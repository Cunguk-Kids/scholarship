import { TokenRateContext, type TokenRateContextType } from '@/components/providers/TokenProvider';
import { useContext } from 'react';

export function useTokenRate(): TokenRateContextType {
  const context = useContext(TokenRateContext);
  if (context === undefined) {
    throw new Error('useTokenRate must be used within a TokenRateProvider');
  }
  return context;
}

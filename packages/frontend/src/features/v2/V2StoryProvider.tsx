import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { mock } from 'wagmi/connectors';
import { TokenRateProvider } from '@/components/providers/TokenProvider';
import { darkTheme, XellarKitProvider } from '@xellar/kit';
export const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const mockWagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    mock({
      accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});

export const V2StoryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={mockWagmiConfig}>
      <QueryClientProvider client={mockQueryClient}>
        <XellarKitProvider theme={darkTheme}>
          <TokenRateProvider>{children}</TokenRateProvider>
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

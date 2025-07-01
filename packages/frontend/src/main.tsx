import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./constants/wagmi.config";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientConfig } from "./constants/queryclient.config";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClientConfig}>
          <RainbowKitProvider coolMode>
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}

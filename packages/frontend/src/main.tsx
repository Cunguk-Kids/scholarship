import "./index.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./constants/wagmi.config";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientConfig } from "./constants/queryclient.config";
import { darkTheme, XellarKitProvider } from "@xellar/kit";

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
          <XellarKitProvider theme={darkTheme}>
            <RouterProvider router={router} />
          </XellarKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}

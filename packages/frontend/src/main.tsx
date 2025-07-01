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
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const theme = lightTheme();

theme.colors.actionButtonBorder = "#6A88F8";
theme.radii.connectButton = "8px";
theme.colors.connectButtonBackground = "#6A88F8";
theme.colors.connectButtonText = "white";
theme.shadows.connectButton = "4px 4px 0px 0px rgb(0, 0, 0)";

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClientConfig}>
          <RainbowKitProvider coolMode theme={theme}>
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}

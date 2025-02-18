"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "4f69cd9e3add96465fdfd34b55057537",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitTheme>{children}</RainbowKitTheme>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

const RainbowKitTheme = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <RainbowKitProvider theme={theme === "dark" ? darkTheme() : lightTheme()}>
      {children}
    </RainbowKitProvider>
  );
};

export default Providers;

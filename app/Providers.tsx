"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  Chain,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "4f69cd9e3add96465fdfd34b55057537",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const queryClient = new QueryClient();

const getSiweMessageOptions = () => ({
  statement: "Sign in to my RainbowKit app",
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <RainbowKitSiweNextAuthProvider
              getSiweMessageOptions={getSiweMessageOptions}
            >
              <RainbowKitTheme>{children}</RainbowKitTheme>
            </RainbowKitSiweNextAuthProvider>
          </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

const RainbowKitTheme = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const initialChain: Chain = mainnet;
  return (
    <RainbowKitProvider
      initialChain={initialChain}
      theme={
        theme === "dark"
          ? darkTheme({
              accentColor: "#7b3fe4",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })
          : lightTheme({
              accentColor: "#007bff",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
};

export default Providers;

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui";
import Providers from "./Providers";
import LayoutProvider from "./LayoutProvider";
import { CurrencyProvider } from "@/contexts/currency-context";

export const metadata: Metadata = {
  title: "GamerTokenHub",
  description: "Created by us",
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/favicon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>

      <body>
        <Providers>
          <CurrencyProvider>
            <LayoutProvider>
              {children}
              <Toaster />
            </LayoutProvider>
          </CurrencyProvider>
        </Providers>
      </body>
    </html>
  );
}

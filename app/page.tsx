import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Welcome to My DApp</h1>

      {/* RainbowKit ConnectButton without theme prop */}
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        chainStatus={{
          smallScreen: "icon",
          largeScreen: "full",
        }}
      />

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  );
}

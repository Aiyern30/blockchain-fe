import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// import ConnectButton from "@/components/ui/wallet-dropdown/ConnectButton";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Welcome to My DApp</h1>

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
      {/* <ConnectButton /> */}
      <ThemeToggle />
    </div>
  );
}

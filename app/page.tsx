import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div>
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
      />
      <ThemeToggle />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletClient } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/";

export default function ProfileRedirectPage() {
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  useEffect(() => {
    if (walletClient?.account.address) {
      router.replace(`/Profile/${walletClient.account.address}`);
    }
  }, [walletClient, router]);

  const handleConnectWallet = () => {
    toast.warning(
      "Please connect your wallet using the button in the top-right."
    );
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold mb-4">
        Connect Wallet to View Profile
      </h1>
      <p className="text-gray-400 dark:text-gray-500 mb-6">
        You need to connect your wallet to access your profile page.
      </p>
      <Button variant="default" onClick={handleConnectWallet}>
        Connect Wallet
      </Button>
    </div>
  );
}

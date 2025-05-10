"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletClient } from "wagmi";
import CardEmptyUI from "@/components/CardEmptyUI";

export default function ProfileRedirectPage() {
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  useEffect(() => {
    if (walletClient?.account.address) {
      router.replace(`/Profile/${walletClient.account.address}`);
    }
  }, [walletClient, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
      <CardEmptyUI
        title="Connect Wallet to View Profile"
        description="You need to connect your wallet to access your profile page."
        buttonText="Connect Wallet"
        type="profile"
      />
    </div>
  );
}

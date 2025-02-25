"use client";

import { ChatBot } from "@/components/ChatBot";
import { FloatingIcon } from "@/components/FloatingIcon";
import Navbar from "@/components/Navbar";
import { RoboAnimation } from "@/components/RoboAnimation";
import { SparklesCore } from "@/components/Sparkles";
import WalletConnectDropdown from "@/components/wallet-dropdown/WalletConnectDropdown";
import { useDeviceType } from "@/utils/useDeviceType";
import React from "react";

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useDeviceType();
  return (
    <div
      className="min-h-screen antialiased relative overflow-hidden
      bg-blue-900 
      dark:bg-black/[0.96] dark:bg-grid-white/[0.02] bg-grid-black/[0.05]"
    >
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <Navbar />
      {isMobile && (
        <div className="flex justify-center py-5">
          <WalletConnectDropdown />
        </div>
      )}

      <div className="relative z-10 p-5">{children}</div>
      {!isMobile && (
        <div className="absolute bottom-0 right-0 w-96 h-96">
          <RoboAnimation />
        </div>
      )}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingIcon count={4} />
      </div>
      <ChatBot />
    </div>
  );
};

export default LayoutProvider;

"use client";

import { FloatingIcon } from "@/components/FloatingIcon";
import Navbar from "@/components/Navbar";
import { RoboAnimation } from "@/components/RoboAnimation";
import { SparklesCore } from "@/components/Sparkles";
import WalletConnectDropdown from "@/components/wallet-dropdown/WalletConnectDropdown";
import { useDeviceType } from "@/utils/useDeviceType";
import React from "react";

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, isTablet } = useDeviceType();

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
      {(isMobile || isTablet) && (
        <div className="flex justify-center py-5 relative z-40">
          <WalletConnectDropdown />
        </div>
      )}

      <div className="relative z-40 p-5">{children}</div>

      {!isMobile && (
        <div className="absolute bottom-0 right-0 w-96 h-96 z-20">
          <RoboAnimation />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingIcon count={4} />
      </div>
    </div>
  );
};

export default LayoutProvider;

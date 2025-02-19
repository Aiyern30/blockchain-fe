import Navbar from "@/components/Navbar";
import { SparklesCore } from "@/components/Sparkles";
import React from "react";

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="min-h-screen antialiased relative overflow-hidden
      bg-blue-900 
      dark:bg-black/[0.96] dark:bg-grid-white/[0.02] bg-grid-black/[0.05]"
    >
      {/* Background Sparkles */}
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

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-5">{children}</div>
    </div>
  );
};

export default LayoutProvider;

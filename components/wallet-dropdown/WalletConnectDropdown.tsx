"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MotionButton from "@/components/wallet-dropdown/MotionButton";
import Image from "next/image";

export default function WalletConnectDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <ConnectButton.Custom>
        {({ account, openConnectModal }) => {
          const isConnected = !!account;

          return isConnected ? (
            // If connected via RainbowKit, show the full RainbowKit button
            <ConnectButton />
          ) : (
            <div className="relative">
              <MotionButton
                onClick={() => setIsOpen(!isOpen)}
                title="Connect Wallet"
                icon={
                  <motion.div
                    className="flex items-center justify-center origin-center"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown className="w-4 h-4 text-white dark:text-gray-200" />
                  </motion.div>
                }
                iconPosition="right"
              />

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute mt-2 w-60 rounded-lg shadow-xl border bg-white 
                    dark:bg-gray-900 border-gray-300 dark:border-gray-700 
                    p-4 z-50"
                >
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={openConnectModal}
                      className="flex items-center gap-3 p-3 rounded-lg text-white dark:text-gray-200 
                        bg-gradient-to-r from-[#7b3fe4] to-[#4F46E5] 
                        dark:from-[#007bff] dark:to-[#0056b3] 
                        hover:opacity-90 transition-all"
                    >
                      <Image
                        src="/rainbowkit.png"
                        alt="RainbowKit Icon"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span>Rainbow Kit</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

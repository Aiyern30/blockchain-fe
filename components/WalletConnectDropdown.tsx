"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Web3AuthButton from "./Web3AuthButton";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function WalletConnectDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* RainbowKit UI replaces the dropdown when connected */}
      <ConnectButton.Custom>
        {({ account, openConnectModal }) =>
          account ? (
            // When connected, show the RainbowKit UI instead of the dropdown
            <ConnectButton showBalance={false} />
          ) : (
            // Show dropdown when no wallet is connected
            <div>
              <Button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 text-white flex items-center px-4 py-2 rounded"
              >
                Connect Wallet <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute mt-2 w-56 bg-gray-800 shadow-lg rounded p-4 z-50"
                >
                  <div className="flex flex-col space-y-2">
                    {/* Clicking this will open RainbowKit's modal */}
                    <Button
                      onClick={openConnectModal}
                      className="bg-gray-700 text-white p-2 rounded"
                    >
                      Connect Wallet
                    </Button>
                    {/* Web3Auth login */}
                    <Button className="bg-gray-700 text-white p-2 rounded">
                      <Web3AuthButton />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )
        }
      </ConnectButton.Custom>
    </div>
  );
}

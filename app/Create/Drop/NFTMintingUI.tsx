"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/";
import {
  CheckCircle,
  Loader2,
  Sparkles,
  Zap,
  LinkIcon,
  ExternalLink,
} from "lucide-react";

// Minting stages
const STAGES = [
  { id: "preparing", label: "Preparing Assets", duration: 1500 },
  { id: "uploading", label: "Uploading to IPFS", duration: 2000 },
  { id: "minting", label: "Minting on Blockchain", duration: 2500 },
  { id: "confirming", label: "Confirming Transaction", duration: 1500 },
  { id: "complete", label: "Minting Complete", duration: 0 },
];

interface NFTMintingUIProps {
  txHash?: string;
  walletAddress?: string;
}

export default function NFTMintingUI({
  txHash,
  walletAddress,
}: NFTMintingUIProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(
    txHash || null
  );

  // Start the minting process
  const startMinting = () => {
    setIsMinting(true);
    setCurrentStage(0);
  };

  // Reset the minting process
  const resetMinting = () => {
    setIsMinting(false);
    setCurrentStage(0);
    setTransactionHash(null);
  };

  useEffect(() => {
    if (!isMinting) return;

    let timer: NodeJS.Timeout | null = null;

    if (currentStage < STAGES.length - 1) {
      // Move to next stage after duration
      timer = setTimeout(() => {
        setCurrentStage((prev) => prev + 1);
      }, STAGES[currentStage].duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStage, isMinting]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">NFT Minting</h2>
          <p className="text-gray-400">
            {isMinting
              ? currentStage === STAGES.length - 1
                ? "Your NFT has been successfully minted!"
                : "Please wait while we mint your NFT"
              : "Start the process to mint your new NFT"}
          </p>
        </div>

        {/* NFT Preview */}
        <div className="relative mb-6 overflow-hidden rounded-lg">
          <div className="aspect-square w-full bg-gray-700">
            <img
              src="/placeholder.svg?height=400&width=400"
              alt="NFT Preview"
              className="h-full w-full object-cover"
            />

            {/* Overlay during minting */}
            {isMinting && currentStage < STAGES.length - 1 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="rounded-full bg-purple-500/20 p-8"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  <Sparkles className="h-12 w-12 text-purple-400" />
                </motion.div>
              </motion.div>
            )}

            {/* Success overlay */}
            {isMinting && currentStage === STAGES.length - 1 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Transaction Hash & Wallet Address (only show when complete) */}
        {isMinting && currentStage === STAGES.length - 1 && transactionHash && (
          <motion.div
            className="mb-6 rounded-lg bg-gray-700 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Transaction Hash:</span>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-sm">View on Etherscan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 truncate text-sm font-mono text-gray-300">
                {transactionHash}
              </p>
            </div>

            {walletAddress && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Wallet Address:</span>
                </div>
                <p className="truncate text-sm font-mono text-gray-300">
                  {walletAddress}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {!isMinting ? (
            <Button
              onClick={startMinting}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 px-8 py-3 font-medium text-white hover:from-purple-700 hover:to-blue-600"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Minting
              </span>
            </Button>
          ) : currentStage === STAGES.length - 1 ? (
            <Button
              onClick={resetMinting}
              className="rounded-lg bg-green-600 px-8 py-3 font-medium text-white hover:bg-green-700"
            >
              Mint Another
            </Button>
          ) : (
            <Button
              disabled
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-8 py-3 font-medium text-gray-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Minting in Progress...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

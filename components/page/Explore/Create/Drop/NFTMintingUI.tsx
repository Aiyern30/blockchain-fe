"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/";
import {
  CheckCircle,
  Loader2,
  Sparkles,
  Zap,
  LinkIcon,
  ExternalLink,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { StagingStatus } from "@/type/stagingStatus";

const STATUS_STAGES = {
  idle: { label: "Idle", duration: 0 },
  checking: { label: "Checking Wallet", duration: 1500 },
  uploading: { label: "Uploading to IPFS", duration: 2000 },
  minting: { label: "Minting on Blockchain", duration: 2500 },
  exists: { label: "NFT Already Exists", duration: 0 },
  done: { label: "Minting Complete", duration: 0 },
  cancelled: { label: "Transaction Cancelled", duration: 0 },
  error: { label: "Error Occurred", duration: 0 },
};

interface NFTMintingUIProps {
  status: StagingStatus;
  txHash?: string[] | null;
  walletAddress?: string | null;
  onRetry: () => void;
}

export default function NFTMintingUI({
  status,
  txHash,
  walletAddress,
  onRetry,
}: NFTMintingUIProps) {
  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center ">
      <div className="w-full max-w-md rounded-xl p-6 shadow-xl bg-gray-900">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">NFT Minting</h2>
          <p className="text-gray-400">{STATUS_STAGES[status].label}</p>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-lg">
          <div className="aspect-square w-full bg-gray-700">
            {status !== "done" &&
              status !== "idle" &&
              status !== "exists" &&
              status !== "cancelled" && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="rounded-full bg-purple-500/20 p-8"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles className="h-12 w-12 text-purple-400" />
                  </motion.div>
                </motion.div>
              )}

            {status === "done" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </motion.div>
              </motion.div>
            )}

            {status === "exists" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <AlertTriangle className="h-16 w-16 text-yellow-400" />
                </motion.div>
              </motion.div>
            )}

            {status === "cancelled" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <XCircle className="h-16 w-16 text-red-400" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Transaction Hash & Wallet Address (only show when complete) */}
        {status === "done" && txHash && Array.isArray(txHash) && (
          <div className="mb-6 rounded-lg bg-gray-700 p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Transaction Hashes:
                </span>
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {txHash.map((hash, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="text-sm">Tx {index + 1}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="truncate text-sm font-mono text-gray-300">
                      {hash}
                    </p>
                  </div>
                ))}
              </div>
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
          </div>
        )}

        {/* Exists Warning UI */}
        {status === "exists" && (
          <div className="mb-6 rounded-lg bg-yellow-700/40 p-3 border border-yellow-500">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-yellow-300">
                This NFT has already been minted!
              </span>
            </div>
          </div>
        )}

        {status === "cancelled" && (
          <div className="mb-6 rounded-lg bg-red-700/40 p-3 border border-red-500">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-300">
                Transaction was cancelled by the user.
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {status === "done" || status === "exists" ? (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onRetry()}
            >
              Mint Another
            </Button>
          ) : status === "cancelled" || status === "error" ? (
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onRetry()}
            >
              Retry
            </Button>
          ) : (
            <Button
              disabled
              className="bg-gray-700 text-gray-400 flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

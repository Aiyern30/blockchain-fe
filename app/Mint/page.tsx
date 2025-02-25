"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { getNFTContract } from "@/lib/nftContract";

export default function MintNFT() {
  const { address: rainbowkitAddress, isConnected: isRainbowKitConnected } =
    useAccount();
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Retrieve Web3Auth address from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem("web3AuthAddress");
    if (storedAddress) {
      setWeb3AuthAddress(storedAddress);
    }
  }, []);

  // Determine the active wallet address (RainbowKit or Web3Auth)
  const activeAddress = rainbowkitAddress || web3AuthAddress;
  const isConnected = isRainbowKitConnected || !!web3AuthAddress;

  const mintNFT = async () => {
    if (!isConnected) return alert("Please connect your wallet first!");

    try {
      setMinting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getNFTContract(signer);

      const tx = await contract.mintNFT(
        activeAddress!,
        "ipfs://bafkreicg3rfy3gv2eawoclfulczhqxudljoetuh4ikl7kri2cwwrlwnxtik"
      );

      await tx.wait();
      setTxHash(tx.hash);
      alert("NFT Minted Successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed!");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg">
      {isConnected ? (
        <>
          <p className="mb-4">Connected: {activeAddress}</p>
          <button
            onClick={mintNFT}
            disabled={minting}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
          >
            {minting ? "Minting..." : "Mint NFT"}
          </button>
          {txHash && (
            <p className="mt-3">
              Transaction:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                View on Etherscan
              </a>
            </p>
          )}
        </>
      ) : (
        <p>Please connect your wallet first to mint an NFT.</p>
      )}
    </div>
  );
}

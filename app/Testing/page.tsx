"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";

export default function TestTotalSupply() {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalSupply = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      const supply = await nftContract.totalSupply();
      setTotalSupply(Number(supply.toString())); // Convert BigNumber to number
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      setTotalSupply(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={fetchTotalSupply}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Fetch Total Supply
      </button>

      {totalSupply !== null && (
        <p className="text-green-600">Total Supply: {totalSupply}</p>
      )}

      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getERC721TokenContract } from "@/lib/erc721Config";
import { ethers } from "ethers";
import { useState } from "react";

export default function MintNFTForm() {
  const [tokenId, setTokenId] = useState(""); // State for tokenId
  const [price, setPrice] = useState(""); // State for price
  const [listingFee, setListingFee] = useState("0.0015"); // State for listing fee
  const [collectionAddress, setCollectionAddress] = useState(""); // State for collection address
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const listNFT = async (signer: ethers.Signer) => {
    if (!tokenId || !price || !listingFee || !collectionAddress) {
      setStatus(
        "Please provide all required fields: tokenId, price, listing fee, and collection address."
      );
      return;
    }

    try {
      // Convert listing fee and price
      const parsedListingFee = ethers.parseUnits(listingFee, "ether"); // Convert listing fee to wei
      const parsedPrice = ethers.parseUnits(price, "wei"); // Convert price to wei

      // Get contract instance using the helper function
      const marketplaceAddress = "0xd637898a14E20211BFD466f1b3f8A67cbDBf748E"; // your deployed marketplace address

      // Step 1: Approve the marketplace contract to handle the NFT transfer
      const nftTokenContract = getERC721TokenContract(
        signer,
        collectionAddress
      ); // Get the NFT contract
      const tx = await nftTokenContract.approve(marketplaceAddress, tokenId); // Approve transaction
      await tx.wait(); // Wait for the transaction to be confirmed

      setStatus("NFT approved for listing...");

      // Step 2: List the NFT on the marketplace
      const marketplaceContract = new ethers.Contract(
        marketplaceAddress,
        [
          // Add the marketplace contract ABI here
          "function listNFT(address collection, uint256 tokenId, uint256 price) external payable",
        ],
        signer
      );
      const txList = await marketplaceContract.listNFT(
        collectionAddress, // Collection contract address
        tokenId,
        parsedPrice, // Price in wei
        { value: parsedListingFee } // Listing fee (converted to wei)
      );
      await txList.wait(); // Wait for transaction to be mined

      setStatus(`✅ NFT listed successfully!`);
    } catch (err: any) {
      console.error("Error listing NFT:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleListNFT = async () => {
    console.log("Triggered listNFT");

    if (!tokenId || !price || !listingFee || !collectionAddress) {
      setStatus("Please provide all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("MetaMask connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Signer fetched");

      // Call listNFT using the signer from the browser provider
      await listNFT(signer);
    } catch (err: any) {
      console.error("Error in handleListNFT:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Test List NFT</h1>

      {/* Collection Address Input */}
      <input
        type="text"
        placeholder="Collection Address (contract)"
        className="w-full p-2 border"
        value={collectionAddress}
        onChange={(e) => setCollectionAddress(e.target.value)}
      />

      {/* Token ID Input */}
      <input
        type="number"
        placeholder="Token ID"
        className="w-full p-2 border"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />

      {/* Price Input */}
      <input
        type="text"
        placeholder="Price (in Wei)"
        className="w-full p-2 border"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* Listing Fee Input */}
      <input
        type="text"
        placeholder="Listing Fee (in Ether)"
        className="w-full p-2 border"
        value={listingFee}
        onChange={(e) => setListingFee(e.target.value)}
      />

      {/* Submit Button */}
      <button
        onClick={handleListNFT}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Processing..." : "List NFT"}
      </button>

      {status && <p className="text-sm text-gray-700 mt-2">{status}</p>}
    </div>
  );
}

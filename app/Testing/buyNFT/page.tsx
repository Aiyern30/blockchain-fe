"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getERC721TokenContract } from "@/lib/erc721Config";
import { ethers } from "ethers";
import { useState } from "react";

export default function BuyNFTForm() {
  const [itemId, setItemId] = useState(""); // State for itemId
  const [price, setPrice] = useState(""); // State for price
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buyNFT = async (signer: ethers.Signer) => {
    if (!itemId || !price) {
      setStatus("Please provide both itemId and price.");
      return;
    }

    // Validate price input (ensure it's a valid number)
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setStatus("Please provide a valid price greater than 0.");
      return;
    }

    try {
      // Convert price to Wei
      const parsedPrice = ethers.parseUnits(price, "wei");

      // Get contract instance using the helper function
      const marketplaceAddress = "0xd637898a14E20211BFD466f1b3f8A67cbDBf748E"; // your deployed marketplace address

      // Step 1: Get the item details from the marketplace contract (marketItems)
      const marketplaceContract = new ethers.Contract(
        marketplaceAddress,
        [
          "function marketItems(uint256 itemId) external view returns (address collection, uint256 tokenId, uint256 price, bool sold, address seller, address owner)",
        ],
        signer
      );

      console.log("Fetching item details...");
      const item = await marketplaceContract.marketItems(itemId);
      console.log("Item details:", item); // Log the item to see what it returns

      // Check if item exists and is not sold
      if (!item || item.sold) {
        setStatus("NFT item is not available or already sold.");
        return;
      }

      const { tokenId, collection: collectionAddress } = item;

      // Step 2: Approve the marketplace to handle the NFT transfer (if not approved yet)
      const nftTokenContract = getERC721TokenContract(
        signer,
        collectionAddress
      );
      const currentApproval = await nftTokenContract.getApproved(tokenId);

      console.log("Current approval:", currentApproval); // Log current approval

      // Check if the marketplace is already approved
      if (currentApproval !== marketplaceAddress) {
        const approveTx = await nftTokenContract.approve(
          marketplaceAddress,
          tokenId
        );
        await approveTx.wait();
        setStatus("Marketplace approved for transfer.");
      }

      // Step 3: Execute the market sale (buy the NFT)
      console.log("Executing market sale...");
      const tx = await marketplaceContract.createMarketSale(itemId, {
        value: parsedPrice, // Send the correct price for the NFT
      });

      await tx.wait(); // Wait for transaction confirmation

      setStatus(`✅ NFT bought successfully!`);
    } catch (err: any) {
      console.error("Error buying NFT:", err);

      // Log additional details about the error
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleBuyNFT = async () => {
    console.log("Triggered buyNFT");

    if (!itemId || !price) {
      setStatus("Please provide both itemId and price.");
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

      // Call buyNFT using the signer from the browser provider
      await buyNFT(signer);
    } catch (err: any) {
      console.error("Error in handleBuyNFT:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Buy NFT</h1>

      {/* Item ID Input */}
      <input
        type="number"
        placeholder="Item ID"
        className="w-full p-2 border"
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
      />

      {/* Price Input */}
      <input
        type="text"
        placeholder="Price (in Wei)"
        className="w-full p-2 border"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* Submit Button */}
      <button
        onClick={handleBuyNFT}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Processing..." : "Buy NFT"}
      </button>

      {status && <p className="text-sm text-gray-700 mt-2">{status}</p>}
    </div>
  );
}

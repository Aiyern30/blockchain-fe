/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { getERC721TokenContract } from "@/lib/erc721Config";
import { getMarketplaceContract } from "@/lib/marketplaceConfig";

export default function ViewListedNFTs() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buyingTokenId, setBuyingTokenId] = useState<number | null>(null);

  const fetchListedNFTs = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = getMarketplaceContract(provider);

      const items = await marketplace.fetchMarketItems();
      console.log("Fetched items:", items);
      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          const collection = item[0];
          const tokenId = item[1];
          const seller = item[2];
          const owner = item[3];
          const price = item[4];
          const sold = item[5];
      
          const nftContract = getERC721TokenContract(provider, collection);
      
          let tokenURI = "";
          try {
            tokenURI = await nftContract.tokenURI(tokenId);
          } catch (err) {
            console.warn(`Skipping tokenId ${tokenId}: tokenURI() call failed`);
            return null; // Skip this NFT
          }

          // 🛠 Correctly handle metadataURL
          let metadataURL = "";
          if (tokenURI.startsWith("ipfs://")) {
            metadataURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          } else if (tokenURI.startsWith("http")) {
            metadataURL = tokenURI;
          } else {
            metadataURL = `https://${tokenURI}`;
          }

          // Default values
          let imageURL = "";
          let name = `NFT #${tokenId}`;
          let description = "No description";

          const isDirectImage = metadataURL.endsWith(".png") || metadataURL.endsWith(".jpg") || metadataURL.endsWith(".jpeg") || metadataURL.endsWith(".gif");

          if (isDirectImage) {
            // Directly use image if it's image file
            imageURL = metadataURL;
          } else {
            try {
              const metadata = await axios.get(metadataURL);
              if (metadata.data.image) {
                imageURL = metadata.data.image.startsWith("ipfs://")
                  ? metadata.data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : metadata.data.image;
              }
              if (metadata.data.name) name = metadata.data.name;
              if (metadata.data.description) description = metadata.data.description;
            } catch (err) {
              console.warn(`Metadata not found for tokenId ${tokenId}`, err);
              imageURL = "/default-image.png"; // fallback
            }
          }
      
          return {
            collection,
            tokenId: Number(tokenId),
            seller,
            owner,
            price: ethers.formatEther(price),
            sold,
            image: imageURL,
            name,
            description,
          };
        })
      );
      
      // Remove nulls (NFTs with broken tokenURI)
      setNfts(enrichedItems.filter((nft) => nft !== null));
      
    } catch (error) {
      console.error("Error loading listed NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (nft: any) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      setBuyingTokenId(nft.tokenId);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = getMarketplaceContract(signer);

      const tx = await marketplace.buyNFT(
        nft.collection,
        nft.tokenId,
        {
          value: ethers.parseUnits(nft.price, "ether")
        }
      );
      await tx.wait();

      alert("🎉 Purchase successful!");
      fetchListedNFTs(); // Refresh list
    } catch (error: any) {
      console.error("Error buying NFT:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setBuyingTokenId(null);
    }
  };

  useEffect(() => {
    fetchListedNFTs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">Listed NFTs</h1>

      {loading ? (
        <p className="text-center">Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p className="text-center">No NFTs listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {nfts.map((nft, idx) => (
            <div key={idx} className="border rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover" />
              <div className="p-4 flex flex-col h-full">
                <h2 className="text-lg font-semibold">{nft.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{nft.description}</p>
                <div className="text-sm text-gray-400 mb-2">
                  Collection: <span className="font-mono">{nft.collection.slice(0, 6)}...{nft.collection.slice(-4)}</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Token ID: #{nft.tokenId}
                </div>
                <div className="mt-2 font-bold text-blue-600">{nft.price} ETH</div>

                {/* Buy Button or Sold Out */}
                {nft.sold ? (
                  <div className="mt-4 text-center text-red-500 font-bold">SOLD OUT</div>
                ) : (
                  <button
                    onClick={() => handleBuy(nft)}
                    disabled={buyingTokenId === nft.tokenId}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {buyingTokenId === nft.tokenId ? "Processing..." : "Buy Now"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

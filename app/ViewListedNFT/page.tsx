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
      const signer = await provider.getSigner();

      const items = await marketplace.fetchMarketItems(); // ✅ corrected

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          const marketplace = getMarketplaceContract(provider); // still use provider
          const nftContract = getERC721TokenContract(provider, item.collection); // ✅ use provider only


          const tokenURI = await nftContract.tokenURI(item.tokenId);
          const metadataURL = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
          const metadata = await axios.get(metadataURL);
          console.log("Fetching tokenURI:", tokenURI);
          // const metadata = await axios.get(metadataURL);
          console.log("Metadata for tokenId:", item.tokenId, metadata.data);
          let imageURL = "";

          

          if (metadata.data.image) {
            imageURL = metadata.data.image.startsWith("ipfs://")
              ? metadata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
              : metadata.data.image;
          } else {
            imageURL = "/default-image.png"; // optional fallback
          }

          return {
            collection: item.collection,
            tokenId: Number(item.tokenId),
            price: ethers.formatEther(item.price),
            seller: item.seller,
            image: imageURL,
            name: metadata.data.name ?? "Unknown",
            description: metadata.data.description ?? "No description",
          };
        })
      );

      setNfts(enrichedItems);
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

                {/* Buy Button */}
                <button
                  onClick={() => handleBuy(nft)}
                  disabled={buyingTokenId === nft.tokenId}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                  {buyingTokenId === nft.tokenId ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

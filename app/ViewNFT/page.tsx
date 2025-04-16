/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getERC721Contract } from "@/lib/erc721Config";
import axios from "axios";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

export default function ViewMarketNFTs() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMarketNFTs = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getERC721Contract(signer);

      const items = await contract.fetchMarketItem();

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          const tokenURI = await contract.tokenURI(item.tokenId);
          const ipfsURL = tokenURI.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/"
          );
          const metadata = await axios.get(ipfsURL);

          let imageURL = metadata.data.image;
          if (imageURL.startsWith("ipfs://")) {
            imageURL = imageURL.replace(
              "ipfs://",
              "https://gateway.pinata.cloud/ipfs/"
            );
          }

          return {
            tokenId: Number(item.tokenId),
            price: ethers.formatEther(item.price),
            seller: item.seller,
            image: imageURL,
            name: metadata.data.name,
            description: metadata.data.description,
          };
        })
      );

      setNfts(enrichedItems);
    } catch (err) {
      console.error("Error loading NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketNFTs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Marketplace NFTs</h1>
      {loading ? (
        <p>Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-60 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold">{nft.name}</h2>
              <p className="text-sm text-gray-500">{nft.description}</p>
              <p className="mt-2 font-bold text-blue-600">{nft.price} ETH</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

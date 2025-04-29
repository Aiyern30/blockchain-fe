"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import { toast } from "sonner";
import Image from "next/image"; // Import Image from next/image

const Page = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [collectionDetails, setCollectionDetails] = useState<
    {
      address: string;
      name: string;
      description: string;
      image: string;
      externalLink: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!isConnected || !address || !walletClient) {
        toast.warning("Please complete all fields and connect your wallet!", {
          style: {
            backgroundColor: "#f59e0b",
            color: "white",
          },
        });
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      try {
        const addresses: string[] = await nftContract.getMyCollections();
        const details = await Promise.all(
          addresses.map(async (addr) => {
            const detail = await nftContract.collectionDetails(addr);
            return {
              address: addr,
              name: detail.name,
              description: detail.description,
              image: detail.image,
              externalLink: detail.externalLink,
            };
          })
        );

        setCollectionDetails(details);
      } catch (error) {
        console.error("Failed to fetch collections or details:", error);
      }
    };

    fetchCollections();
  }, [address, isConnected, walletClient]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My NFT Collections</h1>
      {collectionDetails.length === 0 ? (
        <p>No collections found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collectionDetails.map((collection, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              <Image
                src={`https://ipfs.io/ipfs/${collection.image.replace(
                  "ipfs://",
                  ""
                )}`}
                alt={collection.name}
                width={400}
                height={250}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">{collection.name}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  {collection.description}
                </p>
                <a
                  href={collection.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm underline"
                >
                  View External Link
                </a>
                <p className="mt-2 text-xs text-gray-400 break-words">
                  {collection.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;

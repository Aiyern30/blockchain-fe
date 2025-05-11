/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
  Button,
} from "@/components/ui";
import CardEmptyUI from "@/components/CardEmptyUI";
import { truncateAddress, formatImageUrl } from "@/utils/function";
import { getERC721Contract } from "@/lib/erc721Config";

const PurchasedNft = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();

  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchasedNFTs = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("MetaMask not detected");
      if (!walletClient) return;

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      const items = await nftContract.fetchMyNFTs();

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          const [itemId, collection, tokenId, seller, owner, price, sold] =
            item;

          const nftContract = new ethers.Contract(
            collection,
            ["function tokenURI(uint256 tokenId) view returns (string)"],
            provider
          );

          let tokenURI = "";
          try {
            tokenURI = await nftContract.tokenURI(tokenId);
          } catch {
            return null;
          }

          const metadataURL = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
            : tokenURI;

          let metadata: any = {
            name: `NFT #${tokenId}`,
            description: "No description available",
            image: "/placeholder.svg",
            attributes: [],
            price: ethers.formatEther(price),
          };

          try {
            const res = await axios.get(metadataURL);
            metadata = {
              ...metadata,
              ...res.data,
              image: formatImageUrl(res.data.image),
              price: ethers.formatEther(price),
            };
          } catch (err) {
            console.warn("Failed to fetch metadata:", err);
          }

          return {
            tokenId: Number(tokenId),
            metadataUrl: metadataURL,
            owner,
            metadata,
            marketItem: {
              itemId: Number(itemId),
              collection,
              tokenId: Number(tokenId),
              seller,
              owner,
              price: ethers.formatEther(price),
              sold,
            },
          };
        })
      );

      setNfts(enrichedItems.filter((nft) => nft !== null));
    } catch (error) {
      console.error("Error fetching purchased NFTs:", error);
      toast.error("Failed to load your NFTs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [walletClient]);

  useEffect(() => {
    if (isConnected) fetchPurchasedNFTs();
  }, [isConnected, fetchPurchasedNFTs]);

  return (
    <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Purchased NFTs</h1>
          <p className="text-muted-foreground mt-1">
            View all NFTs you have purchased
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <CardEmptyUI
          title="No Purchased NFTs"
          description="You have not purchased any NFTs yet."
          type="cart"
          buttonText={"Explore"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft, index) => (
            <Card key={index} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={nft.metadata.image}
                  alt={nft.metadata.name}
                  fill
                  className="object-cover"
                />
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{nft.metadata.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Token ID #{nft.tokenId}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {nft.metadata.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">
                  Collection:{" "}
                  <span className="font-mono">
                    {truncateAddress(nft.marketItem.collection)}
                  </span>
                </div>
                <div className="font-semibold text-green-600">
                  {nft.metadata.price} ETH
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button disabled className="w-full">
                  OWNED
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasedNft;

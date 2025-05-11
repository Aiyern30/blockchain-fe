/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

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
import { useFilter } from "@/contexts/filter-context";
import { useRouter } from "next/navigation";

export function PurchasedNft() {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { filter } = useFilter();
  const { view, searchQuery } = filter;

  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchasedNFTs = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("MetaMask not detected");
      if (!walletClient || !isConnected) return;

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      const items = await nftContract.fetchMyNFTs();

      if (items.length === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }

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
  }, [walletClient, isConnected]);

  useEffect(() => {
    if (isConnected) fetchPurchasedNFTs();
  }, [isConnected, fetchPurchasedNFTs]);

  // Filter NFTs based on search query
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return nfts;

    const query = searchQuery.toLowerCase();
    return nfts.filter(
      (nft) =>
        nft.metadata.name.toLowerCase().includes(query) ||
        nft.metadata.description.toLowerCase().includes(query) ||
        nft.marketItem.collection.toLowerCase().includes(query) ||
        nft.tokenId.toString().includes(query)
    );
  }, [nfts, searchQuery]);

  const navigateToNftDetail = (nft: any) => {
    router.push(`/nft/${nft.marketItem.collection}/${nft.tokenId}`);
  };

  const gridColumns = {
    small:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    list: "",
  };

  if (loading) {
    if (view === "list") {
      return (
        <div className="mt-6 w-full space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b animate-pulse w-full"
              >
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
        </div>
      );
    }

    return (
      <div className={`mt-6 grid ${gridColumns[view]} gap-4`}>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden cursor-pointer animate-pulse border hover:border-primary hover:shadow-lg transition-shadow"
            >
              <div className="relative h-44 w-full bg-muted">
                <Skeleton className="h-full w-full absolute inset-0" />
              </div>

              <CardHeader className="space-y-1 pb-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>

              <CardContent className="py-2">
                <Skeleton className="h-4 w-1/2" />
              </CardContent>

              <CardFooter className="pt-1 pb-3 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  if (filteredNfts.length === 0) {
    if (nfts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
          <CardEmptyUI
            title="No Purchased NFTs"
            description="You haven't purchased any NFTs yet!"
            buttonText="Explore NFTs"
            type="collection"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
        <div className="p-8 rounded-lg border max-w-md">
          <h3 className="text-xl font-semibold mb-2">No matching NFTs</h3>
          <p className="text-muted-foreground mb-4">
            No NFTs match your search criteria. Try adjusting your search.
          </p>
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="mt-6 w-full">
        <div className="space-y-2 w-full">
          {filteredNfts.map((nft, index) => (
            <div
              key={index}
              className="flex w-full items-center justify-between border rounded-lg px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigateToNftDetail(nft)}
            >
              <div className="flex items-center gap-5 w-full">
                <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted shrink-0">
                  <Image
                    src={nft.metadata.image || "/placeholder.svg"}
                    alt={nft.metadata.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-medium text-base truncate">
                      {nft.metadata.name}
                    </h3>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      Token #{nft.tokenId}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {nft.metadata.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      Collection:{" "}
                      <span className="font-mono">
                        {truncateAddress(nft.marketItem.collection)}
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {nft.metadata.price} ETH
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      <div className={`grid ${gridColumns[view]} gap-4`}>
        {filteredNfts.map((nft, index) => (
          <Card
            key={index}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border hover:border-primary h-full flex flex-col"
            onClick={() => navigateToNftDetail(nft)}
          >
            <div className="relative h-44 w-full bg-muted">
              <Image
                src={nft.metadata.image || "/placeholder.svg"}
                alt={nft.metadata.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader className="space-y-1 pb-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold truncate">
                  {nft.metadata.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  #{nft.tokenId}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                {nft.metadata.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2 flex-grow">
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
            <CardFooter className="pt-1 pb-3 flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                OWNED
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PurchasedNft;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import CardEmptyUI from "@/components/CardEmptyUI";
import { truncateAddress, formatImageUrl } from "@/utils/function";
import { getMarketplaceFactoryContract } from "@/lib/erc721Config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function ExplorePage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [collections, setCollections] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingTokenId, setBuyingTokenId] = useState<number | null>(null);

  const fetchCollections = async (provider: any, contract: any) => {
    try {
      const collectionAddresses: string[] = await contract.getAllCollections();
      const metadataList = await Promise.all(
        collectionAddresses.map(async (addr: string) => {
          const metadata = await contract.collectionDetails(addr);
          return {
            address: addr,
            name: metadata.name,
            description: metadata.description,
            image: formatImageUrl(metadata.image),
            externalLink: metadata.externalLink,
          };
        })
      );
      setCollections(metadataList);
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  const fetchListedNFTs = async (provider: any, contract: any) => {
    try {
      const items = await contract.fetchMarketItems();
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
            ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            : tokenURI;

          let image = "/placeholder.svg";
          let name = `NFT #${tokenId}`;
          let description = "No description available";

          try {
            const metadata = await axios.get(metadataURL);
            image = formatImageUrl(metadata.data.image);
            name = metadata.data.name || name;
            description = metadata.data.description || description;
          } catch {}

          return {
            itemId: Number(itemId),
            collection,
            tokenId: Number(tokenId),
            seller,
            owner,
            price: ethers.formatEther(price),
            sold,
            image,
            name,
            description,
          };
        })
      );
      setNfts(enrichedItems.filter((nft) => nft !== null));
    } catch (err) {
      console.error("Error loading NFTs:", err);
      toast.error("Failed to load NFTs.");
    }
  };
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? collections.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === collections.length - 1 ? 0 : prev + 1));
  };
  const reloadListedNFTs = useCallback(async () => {
    if (!window.ethereum) {
      console.warn("MetaMask not found");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getMarketplaceFactoryContract(provider);
    await fetchListedNFTs(provider, contract);
  }, []);
  const handleBuy = async (nft: any) => {
    try {
      setBuyingTokenId(nft.tokenId); // Start loading

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getMarketplaceFactoryContract(signer);

      const tx = await contract.createMarketSale(nft.itemId, {
        value: ethers.parseUnits(nft.price, "ether"),
      });

      await tx.wait();
      toast.success("🎉 Purchase successful!");

      reloadListedNFTs();
    } catch (error: any) {
      console.error("Error purchasing NFT:", error);

      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error(`Failed to purchase NFT: ${error.message}`);
      }
    } finally {
      setBuyingTokenId(null);
    }
  };

  useEffect(() => {
    if (isConnected) reloadListedNFTs();
  }, [isConnected, reloadListedNFTs]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (!window.ethereum) {
        console.warn("MetaMask not found");
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getMarketplaceFactoryContract(provider);
      await fetchCollections(provider, contract);
      await fetchListedNFTs(provider, contract);
      setLoading(false);
    };

    init();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>

      {collections.length > 0 && (
        <div
          className="relative w-full h-[350px] sm:h-[450px] rounded-xl overflow-hidden mb-10 shadow-lg group"
          onClick={() =>
            router.push(`/Mint/${collections[currentIndex].address}`)
          }
        >
          <Image
            src={collections[currentIndex].image || "/placeholder.svg"}
            alt={collections[currentIndex].name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay content */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl sm:text-5xl font-bold">
              {collections[currentIndex].name}
            </h2>
            <p className="text-white/80 mt-2 text-sm sm:text-base max-w-3xl">
              {collections[currentIndex].description}
            </p>
            <div className="mt-4 text-white text-sm">
              Address:{" "}
              <span className="font-mono">
                {truncateAddress(collections[currentIndex].address)}
              </span>
            </div>
            {collections[currentIndex].externalLink && (
              <Button
                variant="outline"
                className="mt-4 w-fit"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(collections[currentIndex].externalLink, "_blank");
                }}
              >
                Visit External Link
              </Button>
            )}
          </div>

          {/* Left Arrow */}
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow */}
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Listed NFTs</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <CardEmptyUI
          title="No NFTs Found"
          description="There are no NFTs listed currently."
          type="collection"
          buttonText=""
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft, index) => (
            <Card key={index} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{nft.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {nft.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Collection: {truncateAddress(nft.collection)}
                </p>
                <p className="text-green-600 font-bold">{nft.price} ETH</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  disabled={nft.sold || buyingTokenId === nft.tokenId}
                  className="w-full"
                  onClick={() => handleBuy(nft)}
                >
                  {buyingTokenId === nft.tokenId ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : nft.sold ? (
                    "SOLD OUT"
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

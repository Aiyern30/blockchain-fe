"use client";

import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import Image from "next/image";
import {
  Button,
  Badge,
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

export default function ExplorePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [collections, setCollections] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 340; // each card width + margin
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
          let metadataURL = tokenURI.startsWith("ipfs://")
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getMarketplaceFactoryContract(provider);
      await fetchCollections(provider, contract);
      await fetchListedNFTs(provider, contract);
      setLoading(false);
    };
    if (isConnected) init();
  }, [isConnected]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>

      {collections.length > 0 && (
        <div
          className="relative w-full h-[350px] sm:h-[450px] rounded-xl overflow-hidden mb-10 shadow-lg cursor-pointer group"
          onClick={() => router.push(`/collection/${collections[0].address}`)}
        >
          <Image
            src={collections[0].image || "/placeholder.svg"}
            alt={collections[0].name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl sm:text-5xl font-bold">
              {collections[0].name}
            </h2>
            <p className="text-white/80 mt-2 text-sm sm:text-base max-w-3xl">
              {collections[0].description}
            </p>
            <div className="mt-4 text-white text-sm">
              Address:{" "}
              <span className="font-mono">
                {truncateAddress(collections[0].address)}
              </span>
            </div>
            {collections[0].externalLink && (
              <Button
                variant="outline"
                className="mt-4 w-fit"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation
                  window.open(collections[0].externalLink, "_blank");
                }}
              >
                Visit External Link
              </Button>
            )}
          </div>
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
                <Button disabled={nft.sold} className="w-full">
                  {nft.sold ? "SOLD OUT" : "Buy Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

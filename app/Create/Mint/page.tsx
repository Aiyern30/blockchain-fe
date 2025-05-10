"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import { toast } from "sonner";
import Image from "next/image";
import { ExternalLink, Plus } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { formatImageUrl, truncateAddress } from "@/utils/function";

interface CollectionDetail {
  address: string;
  name: string;
  description: string;
  image: string;
  externalLink: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [collectionDetails, setCollectionDetails] = useState<
    CollectionDetail[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);

      if (!isConnected || !address || !walletClient) {
        toast.warning("Please connect your wallet to view your collections", {
          style: {
            backgroundColor: "#f59e0b",
            color: "white",
          },
        });
        setIsLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const nftContract = getERC721Contract(signer);

        const addresses: string[] = await nftContract.getMyCollections();

        if (addresses.length === 0) {
          setCollectionDetails([]);
          setIsLoading(false);
          return;
        }

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
        toast.error("Failed to load your collections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [address, isConnected, walletClient]);

  const navigateToCreate = () => {
    window.location.href = "/Create/Collection";
  };

  const navigateToMint = (collectionAddress: string) => {
    router.push(`/Create/Mint/${collectionAddress}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My NFT Collections</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your created NFT collections
          </p>
        </div>
        {!isLoading && collectionDetails.length > 0 && (
          <Button variant="outline" onClick={navigateToCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Collection
          </Button>
        )}
      </div>

      {isLoading ? (
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
      ) : collectionDetails.length === 0 ? (
        <CardEmptyUI
          title="No collections found"
          description="You haven't created any NFT collections yet! Start by creating
            your first collection."
          buttonText="Create Your First Collection"
          type="collection"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionDetails.map((collection, index) => (
            <Card
              key={index}
              className="overflow-hidden flex flex-col h-full group relative"
            >
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={formatImageUrl(collection.image) || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("placeholder.svg")) {
                      target.src = "/placeholder.svg";
                    }
                    e.currentTarget.onerror = null;
                  }}
                />

                <div
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => navigateToMint(collection.address)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Add NFT to ${collection.name} collection`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigateToMint(collection.address);
                    }
                  }}
                >
                  <div className="bg-primary rounded-full p-3 mb-2">
                    <Plus className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="text-white font-medium">Add NFT</p>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{collection.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Collection
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {collection.description || "No description provided"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="text-xs text-muted-foreground mb-2 flex items-center">
                  <span className="font-medium mr-1">Address:</span>
                  <span className="font-mono">
                    {truncateAddress(collection.address)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {collection.externalLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(collection.externalLink, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View External Link
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

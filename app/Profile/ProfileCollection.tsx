/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import { toast } from "sonner";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { formatImageUrl, truncateAddress } from "@/utils/function";
import type { GridView } from "@/type/view";
import CardEmptyUI from "@/components/CardEmptyUI";

interface CollectionDetail {
  address: string;
  name: string;
  description: string;
  image: string;
  externalLink: string;
}

interface ProfileCollectionsProps {
  view: GridView;
}

export function ProfileCollections({ view }: ProfileCollectionsProps) {
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

  const navigateToCollections = (address: string) => {
    router.push(`/Mint/${address}`);
  };

  const gridColumns = {
    small:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    list: "",
  };

  if (isLoading) {
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
      <div
        className={`mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}
      >
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden cursor-pointer animate-pulse border hover:border-primary hover:shadow-lg transition-shadow w-64"
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

              <CardFooter className="pt-1 pb-3 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-6" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  if (collectionDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
        <CardEmptyUI
          title="No collections found"
          description="You haven't created any NFT collections yet!"
          buttonText="Create Your First Collection"
          type="collection"
        />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="mt-6 w-full">
        <div className="space-y-2 w-full">
          {collectionDetails.map((collection) => (
            <div
              key={collection.address}
              className="flex w-full items-center justify-between border rounded-lg px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigateToCollections(collection.address)}
            >
              <div className="flex items-center gap-5 w-full">
                <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted shrink-0">
                  <Image
                    src={formatImageUrl(collection.image) || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-medium text-base truncate">
                      {collection.name}
                    </h3>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      Collection
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {collection.description || "No description provided"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Address:{" "}
                    <span className="font-mono">
                      {truncateAddress(collection.address)}
                    </span>
                  </p>
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
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => router.push("/Mint")}>
              View All Collections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className={`grid ${gridColumns[view]} gap-4`}>
        {collectionDetails.map((collection) => (
          <Card
            key={collection.address}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border hover:border-primary"
            onClick={() => navigateToCollections(collection.address)}
          >
            <div className="relative h-44 w-full bg-muted">
              <Image
                src={formatImageUrl(collection.image) || "/placeholder.svg"}
                alt={collection.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader className="space-y-1 pb-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold truncate">
                  {collection.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Collection
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                {collection.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-1 pb-3 text-xs text-muted-foreground flex justify-between items-center">
              <div className="truncate font-mono">
                {truncateAddress(collection.address)}
              </div>
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
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => router.push("/Mint")}>
          View All Collections
        </Button>
      </div>
    </div>
  );
}

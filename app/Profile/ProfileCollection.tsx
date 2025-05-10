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

  const navigateToCollections = () => {
    router.push("/Explore");
  };

  // Determine grid columns based on view
  const gridColumns = {
    small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    list: "",
  };

  if (isLoading) {
    return (
      <div
        className={`mt-6 grid ${
          view !== "list" ? gridColumns[view] : ""
        } gap-4`}
      >
        {view === "list"
          ? // List view skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center border-b p-4 gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
          : // Grid view skeletons
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
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
      <div className="mt-6 space-y-1">
        {collectionDetails.map((collection) => (
          <div
            key={collection.address}
            className="flex items-center justify-between border-b p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={navigateToCollections}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted">
                <Image
                  src={formatImageUrl(collection.image) || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{collection.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    Collection
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {collection.description || "No description provided"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Address:{" "}
                  <span className="font-mono">
                    {truncateAddress(collection.address)}
                  </span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={navigateToCollections}>
            View All Collections
          </Button>
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
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={navigateToCollections}
          >
            <div className="relative h-40 w-full bg-muted">
              <Image
                src={formatImageUrl(collection.image) || "/placeholder.svg"}
                alt={collection.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{collection.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Collection
                </Badge>
              </div>
              <CardDescription className="line-clamp-1 text-xs">
                {collection.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium mr-1">Address:</span>
                <span className="font-mono">
                  {truncateAddress(collection.address)}
                </span>
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={navigateToCollections}>
          View All Collections
        </Button>
      </div>
    </div>
  );
}

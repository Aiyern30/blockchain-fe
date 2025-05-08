/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui";
import { User, UserX, Paintbrush } from "lucide-react";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { isNFTOwner, isCollectionCreator } from "@/utils/nft-utils";

interface NFTOwnershipBadgeProps {
  nft: CollectionNFT;
  userAddress: string;
  collectionOwner: string;
  className?: string;
}

export function NFTOwnershipBadge({
  nft,
  userAddress,
  collectionOwner,
  className = "",
}: NFTOwnershipBadgeProps) {
  // Check if user is the collection creator/owner
  const isCreator = isCollectionCreator(collectionOwner, userAddress);

  // Check if user is the NFT owner
  const isOwner = isNFTOwner(nft, userAddress);

  // Determine badge type and content based on role
  let badgeVariant = "outline";
  let badgeContent = (
    <>
      <UserX className="h-3 w-3 mr-1" />
      Not owned by you
    </>
  );
  let badgeClass = `${className} text-muted-foreground`;

  if (isCreator) {
    badgeVariant = "default";
    badgeContent = (
      <>
        <Paintbrush className="h-3 w-3 mr-1" />
        Creator
      </>
    );
    badgeClass = `${className} bg-purple-600 hover:bg-purple-700`;
  } else if (isOwner) {
    badgeVariant = "default";
    badgeContent = (
      <>
        <User className="h-3 w-3 mr-1" />
        Owner
      </>
    );
    badgeClass = `${className} bg-green-600 hover:bg-green-700`;
  }

  return (
    <Badge variant={badgeVariant as any} className={badgeClass}>
      {badgeContent}
    </Badge>
  );
}

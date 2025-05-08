import { Badge } from "@/components/ui";
import { User, UserX } from "lucide-react";
import { isTrueOwner } from "@/utils/nft-status";
import type { CollectionNFT } from "@/type/CollectionNFT";

interface NFTOwnershipBadgeProps {
  nft: CollectionNFT;
  userAddress: string;
  className?: string;
}

export function NFTOwnershipBadge({
  nft,
  userAddress,
  className = "",
}: NFTOwnershipBadgeProps) {
  const isOwner = isTrueOwner(nft, userAddress);

  return (
    <Badge
      variant={isOwner ? "default" : "outline"}
      className={`${className} ${
        isOwner ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"
      }`}
    >
      {isOwner ? (
        <>
          <User className="h-3 w-3 mr-1" />
          Owned by you
        </>
      ) : (
        <>
          <UserX className="h-3 w-3 mr-1" />
          Not owned by you
        </>
      )}
    </Badge>
  );
}

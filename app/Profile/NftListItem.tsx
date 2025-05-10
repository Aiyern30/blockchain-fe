"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/";
import { truncateAddress } from "@/utils/function";
import { NFTItem } from "./NftCard";

interface NFTListItemProps {
  nft: NFTItem;
}

export function NFTListItem({ nft }: NFTListItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
          <Image
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div>
          <h3 className="font-medium">{nft.name}</h3>
          <p className="text-sm text-muted-foreground">{nft.collection}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Owner: {truncateAddress(nft.owner)}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {nft.chain}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">
            {nft.price} {nft.currency}
          </p>
          <p className="text-xs text-muted-foreground">
            Token ID: {nft.tokenId}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setLiked(!liked)}
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}

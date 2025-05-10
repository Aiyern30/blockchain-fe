"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { truncateAddress } from "@/utils/function";
import { Button, Card, CardContent, CardFooter } from "@/components/ui";

export interface NFTItem {
  id: string;
  name: string;
  image: string;
  collection: string;
  price: string;
  currency: string;
  owner: string;
  tokenId: string;
  chain: string;
}

interface NFTCardProps {
  nft: NFTItem;
  size?: "small" | "medium" | "large";
}

export function NFTCard({ nft, size = "medium" }: NFTCardProps) {
  const [liked, setLiked] = useState(false);

  const sizeClasses = {
    small: "w-full max-w-[180px]",
    medium: "w-full max-w-[240px]",
    large: "w-full max-w-[320px]",
  };

  const imageHeight = {
    small: 180,
    medium: 240,
    large: 320,
  };

  return (
    <Card
      className={`${sizeClasses[size]} overflow-hidden transition-all hover:shadow-md`}
    >
      <div
        className={`relative w-full bg-muted`}
        style={{ height: `${imageHeight[size]}px` }}
      >
        <Image
          src={nft.image || "/placeholder.svg"}
          alt={nft.name}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, 240px"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => setLiked(!liked)}
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>
      <CardContent className="p-3">
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-1">{nft.name}</h3>
          <p className="text-xs text-muted-foreground">{nft.collection}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-0">
        <div className="text-sm">
          <p className="font-medium">
            {nft.price} {nft.currency}
          </p>
          <p className="text-xs text-muted-foreground">
            Owner: {truncateAddress(nft.owner)}
          </p>
        </div>
        <div className="flex items-center justify-center rounded-full bg-muted px-2 py-1">
          <span className="text-xs font-medium">{nft.chain}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

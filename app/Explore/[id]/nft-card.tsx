"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Button, Card, CardContent, CardFooter } from "@/components/ui";
import { ShoppingCart } from "lucide-react";
import { FetchedNFT } from "@/type/NFT";
import { useRouter } from "next/navigation";

interface NFTCardProps {
  nft: FetchedNFT;
  imageSize: number;
}

export function NFTCard({ nft, imageSize }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/Explore/${nft.id}/Details`)}
    >
      <CardContent className="p-0">
        <Image
          alt={nft.title || "NFT Image"}
          src={nft.image || "/nft-placeholder.png"}
          width={imageSize}
          height={imageSize}
          className="aspect-square w-full object-contain"
          unoptimized
        />
      </CardContent>
      <CardFooter className="p-4">
        <div>
          <h3 className="font-medium">{nft.title}</h3>
          <p className="text-sm text-foreground">{nft.floor} ETH</p>
          <p className="text-sm text-muted-foreground">
            Last Sale: {nft.floor} ETH
          </p>
        </div>
      </CardFooter>

      {isHovered && (
        <div
          className="
            absolute bottom-0 w-full 
            flex justify-end
            rounded bg-white/80 shadow
          "
        >
          <Button className="flex w-3/4 items-center justify-center space-x-2 border-r border-r-white bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <span>Buy now</span>
          </Button>
          <Button className="flex w-1/4 items-center justify-center space-x-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <ShoppingCart className="h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

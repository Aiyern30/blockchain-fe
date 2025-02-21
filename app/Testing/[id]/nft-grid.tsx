"use client";

import React from "react";
import { NFTCard } from "./nft-card";
import { GridView } from "@/lib/view";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import Image from "next/image";

interface NFTGridProps {
  view: GridView;
}

const nfts = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: `OCH Genesis Ring #${i + 1}`,
  price: (Math.random() * 2).toFixed(2),
  image:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
  lastSale: (Math.random() * 1).toFixed(2),
  owner: "0x1234...5678",
  timeListed: "2 hours ago",
}));

export function NFTGrid({ view }: NFTGridProps) {
  if (view === "list") {
    return (
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Best Offer</TableHead>
              <TableHead>Last Sale</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Time Listed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfts.map((nft) => (
              <TableRow key={nft.id} className="cursor-pointer h-16">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        className="rounded object-cover"
                        fill
                      />
                    </div>
                    <span>{nft.name}</span>
                  </div>
                </TableCell>
                <TableCell>{nft.price} ETH</TableCell>
                <TableCell>1.33 WETH</TableCell>
                <TableCell>{nft.lastSale} WETH</TableCell>
                <TableCell>{nft.owner}</TableCell>
                <TableCell>{nft.timeListed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  let imageSize = 300;
  switch (view) {
    case "small":
      imageSize = 150;
      break;
    case "medium":
      imageSize = 200;
      break;
    case "large":
      imageSize = 300;
      break;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} imageSize={imageSize} />
      ))}
    </div>
  );
}

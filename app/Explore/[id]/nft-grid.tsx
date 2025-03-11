"use client";

import React from "react";
import { NFTCard } from "./nft-card";
import { GridView } from "@/type/view";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import Image from "next/image";
import { FetchedNFT } from "@/type/NFT";

interface NFTGridProps {
  view: GridView;
  nfts: FetchedNFT[];
}

export function NFTGrid({ view, nfts }: NFTGridProps) {
  if (!nfts || nfts.length === 0) {
    return <div className="text-center text-gray-500">No NFTs found.</div>;
  }

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
                        src={nft.image || "/nft-placeholder.png"}
                        alt={nft.title || "NFT Image"}
                        className="rounded object-cover"
                        fill
                      />
                    </div>
                    <span>{nft.title}</span>
                  </div>
                </TableCell>
                <TableCell>{nft.floor} ETH</TableCell>
                <TableCell>1.33 WETH</TableCell>
                <TableCell>--</TableCell>
                <TableCell>0x1234...5678</TableCell>
                <TableCell>2 hours ago</TableCell>
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
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${imageSize}px, 1fr))`,
      }}
    >
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} imageSize={imageSize} />
      ))}
    </div>
  );
}

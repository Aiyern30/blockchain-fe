"use client";
// Also a Client Component because it doesn't do SSR and uses dynamic data or state

import React from "react";
import { NFTCard } from "./nft-card";

type GridView = "list" | "small" | "medium" | "large";

interface NFTGridProps {
  view: GridView;
}

// Sample NFT data
const nfts = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: `OCH Genesis Ring #${i + 1}`,
  price: (Math.random() * 2).toFixed(2),
  image:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
  lastSale: (Math.random() * 1).toFixed(2),
}));

export function NFTGrid({ view }: NFTGridProps) {
  let gridClasses = "";
  switch (view) {
    case "list":
      gridClasses = "grid grid-cols-1 gap-4";
      break;
    case "small":
      gridClasses = "grid grid-cols-4 gap-4";
      break;
    case "medium":
      gridClasses = "grid grid-cols-5 gap-4";
      break;
    case "large":
      gridClasses = "grid grid-cols-6 gap-4";
      break;
    default:
      gridClasses = "grid grid-cols-3 gap-4";
  }

  return (
    <div className={gridClasses}>
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
}

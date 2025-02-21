"use client";
// Also a Client Component because it doesn't do SSR and uses dynamic data or state

import React from "react";
import { NFTCard } from "./nft-card";
import { GridView } from "@/lib/view";

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
  owner: "0x1234...5678",
  timeListed: "2 hours ago",
}));

export function NFTGrid({ view }: NFTGridProps) {
  if (view === "list") {
    return (
      <table className="w-full table-auto text-sm">
        <thead className="border-b text-left">
          <tr>
            <th className="pb-2">Item</th>
            <th className="pb-2">Current Price</th>
            <th className="pb-2">Best Offer</th>
            <th className="pb-2">Last Sale</th>
            <th className="pb-2">Owner</th>
            <th className="pb-2">Time Listed</th>
          </tr>
        </thead>
        <tbody>
          {nfts.map((nft) => (
            <tr key={nft.id} className="border-b last:border-0">
              {/* ITEM */}
              <td className="py-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <span>{nft.name}</span>
                </div>
              </td>

              {/* CURRENT PRICE */}
              <td className="py-3">
                {/* Add an icon or lightning bolt if you want */}
                <div className="flex items-center space-x-1">
                  <span>{nft.price} ETH</span>
                </div>
              </td>

              {/* BEST OFFER */}
              <td className="py-3">
                1.33 WETH
                {/* Example static data or fetch from your API */}
              </td>

              {/* LAST SALE */}
              <td className="py-3">{nft.lastSale} WETH</td>

              {/* OWNER */}
              <td className="py-3">{nft.owner}</td>

              {/* TIME LISTED */}
              <td className="py-3">{nft.timeListed}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    default:
      imageSize = 300;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} imageSize={imageSize} />
      ))}
    </div>
  );
}

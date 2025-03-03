"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useDeviceType } from "@/utils/useDeviceType";
import { CarouselSkeleton } from "@/components/page/Explore/CarouselSkeleton";
import { TableSkeleton } from "@/components/page/Explore/TableSkeleton";
import DrawingCarousel from "./DrawingCarousel";
import HeroCarousel from "@/components/page/Explore/HeroCarousel";
import CryptoTable from "@/components/page/Explore/CryptoTable";
import { fetchNFTs } from "@/utils/fetchNFTs";
import { FetchedNFT, NFTMetadata } from "@/type/NFT";

const categories = [
  "All",
  "Art",
  "Gaming",
  "Memberships",
  "PFPs",
  "Photography",
  "Music",
];

const timeFrames = ["1h", "6h", "24h", "7d"];

const collections = [
  {
    rank: 1,
    name: "Courtyard.io",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "< 0.01",
    volume: "400",
  },
  {
    rank: 2,
    name: "Gemesis",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "0.05",
    volume: "63",
  },
];

export default function NFTCarousel() {
  const { isMobile } = useDeviceType();
  const shouldSplit = collections.length > 5;

  const [nftItems, setNftItems] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNFTs() {
      setLoading(true);
      const fetchedNFTs: FetchedNFT[] = await fetchNFTs();
      const formattedNFTs = fetchedNFTs.map((nft) => ({
        name: nft.title,
        image: nft.image,
        attributes: [{ trait_type: "Floor", value: nft.floor || "N/A" }],
        id: nft.id,
      }));

      setNftItems(formattedNFTs);
      setLoading(false);
    }

    loadNFTs();
  }, []);

  return (
    <>
      {loading ? (
        <CarouselSkeleton />
      ) : (
        <HeroCarousel categories={categories} items={nftItems} />
      )}

      <div
        className={cn(
          "mt-5 space-y-4",
          isMobile ? "flex flex-col" : "flex justify-between items-center"
        )}
      >
        <div className="flex justify-between items-center">
          <Tabs defaultValue="trending">
            <TabsList className="flex gap-2">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={timeFrames[0]} />
            </SelectTrigger>
            <SelectContent>
              {timeFrames.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TableSkeleton isMobile={isMobile} shouldSplit={shouldSplit} />
      <CryptoTable collections={collections} shouldSplit={shouldSplit} />
      <DrawingCarousel />
    </>
  );
}

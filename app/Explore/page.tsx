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
// import CryptoTable from "@/components/page/Explore/CryptoTable";
import { fetchAllCollections } from "@/utils/fetchAllCollections";

const timeFrames = ["1h", "6h", "24h", "7d"];

interface CollectionData {
  name: string;
  description: string;
  image: string;
  collectionUrl: string;
}

export default function NFTCarousel() {
  const { isMobile } = useDeviceType();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  console.log("collections", collections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      setLoading(true);
      const collections = await fetchAllCollections();
      setCollections(collections);
      setLoading(false);
    }
    loadCollections();
  }, []);

  return (
    <>
      {loading ? (
        <CarouselSkeleton />
      ) : (
        <HeroCarousel
          categories={collections.map((col) => col.name)}
          items={collections}
        />
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

      <TableSkeleton isMobile={isMobile} shouldSplit={collections.length > 5} />
      {/* <CryptoTable collections={collections} shouldSplit={collections.length > 5} /> */}
      <DrawingCarousel />
    </>
  );
}

"use client";

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
import { CarouselSkeleton } from "@/components/page/Testing/CarouselSkeleton";
import { TableSkeleton } from "@/components/page/Testing/TableSkeleton";
import DrawingCat from "./DrawingCat";
import HeroCarousel from "@/components/page/Testing/HeroCarousel";
import CryptoTable from "@/components/page/Testing/CryptoTable";

const categories = [
  "All",
  "Art",
  "Gaming",
  "Memberships",
  "PFPs",
  "Photography",
  "Music",
];

const items = [
  {
    title: "Murakami.Flowers Official",
    floor: "0.2 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "Letters by Vinnie Hager",
    floor: "0.44 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "When Two Stars Collide",
    floor: "0.5 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: false,
  },
  {
    title: "Doodles",
    floor: "3.85 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "Cool Cats NFT",
    floor: "1.2 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "Bored Ape Yacht Club",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "1",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "2",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "3",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "4",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "5",
    floor: "68.9 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
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
  {
    rank: 3,
    name: "Courtyard.io",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "< 0.01",
    volume: "400",
  },
  {
    rank: 4,
    name: "Gemesis",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "0.05",
    volume: "63",
  },
  {
    rank: 5,
    name: "Courtyard.io",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "< 0.01",
    volume: "400",
  },
  {
    rank: 6,
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

  return (
    <>
      <CarouselSkeleton />
      <HeroCarousel categories={categories} items={items} />
      <div
        className={cn(
          "mt-5 space-y-4 ",
          isMobile ? "flex flex-col" : "flex justify-between items-center "
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

      <DrawingCat />
    </>
  );
}

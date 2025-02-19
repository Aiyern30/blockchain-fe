"use client";

import Image from "next/image";
import { VerifiedIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

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
];

export default function NFTCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const previousPage = () => {
    setStartIndex((prev) =>
      prev === 0 ? items.length - itemsPerPage : prev - 1
    );
  };

  const nextPage = () => {
    setStartIndex((prev) =>
      prev + 1 + itemsPerPage > items.length ? 0 : prev + 1
    );
  };

  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full px-4 py-6 relative">
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto py-2 gap-6">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category.toLowerCase()}
              className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-transparent px-0"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative flex items-center justify-between">
        <button
          onClick={previousPage}
          className={cn(
            "h-full w-12",
            "flex items-center justify-center",
            "text-white z-10 transition-opacity duration-300"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {currentItems.map((item, index) => (
            <Card
              key={index}
              className="relative w-full h-80 bg-transparent border-none overflow-hidden group"
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

              <CardContent className="absolute bottom-0 left-0 w-full p-4 z-20">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  {item.verified && (
                    <VerifiedIcon className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <p className="text-white/60 text-sm">Floor: {item.floor}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <button
          onClick={nextPage}
          className={cn(
            "h-full w-12",
            "flex items-center justify-center",
            "text-white z-10 transition-opacity duration-300"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

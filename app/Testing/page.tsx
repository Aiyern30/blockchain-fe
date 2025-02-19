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
    title: "Doodles",
    floor: "3.85 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
];

export default function NFTCarousel() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const previousPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="w-full px-4 py-6 relative">
      {/* Categories Tabs */}
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

      {/* NFT Cards */}
      <div className="relative flex items-center justify-between">
        {/* Left Navigation Button */}
        <button
          onClick={previousPage}
          className={cn(
            "absolute left-0 top-0 h-full w-10",
            "bg-gradient-to-r from-[#4A0D4A] to-transparent",
            "flex items-center justify-center",
            "text-white",
            "opacity-0 hover:opacity-100 z-10 transition-opacity duration-300"
          )}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {currentItems.map((item, index) => (
            <Card
              key={index}
              className="relative w-full h-80 bg-transparent border-none overflow-hidden group"
            >
              {/* Background Image */}
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

              {/* Content */}
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

        {/* Right Navigation Button */}
        <button
          onClick={nextPage}
          className={cn(
            "absolute right-0 top-0 h-full w-10",
            "bg-gradient-to-l from-[#4A0D4A] to-transparent",
            "flex items-center justify-center",
            "text-white",
            "opacity-0 hover:opacity-100 z-10 transition-opacity duration-300"
          )}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

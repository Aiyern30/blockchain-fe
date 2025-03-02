import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDeviceType } from "@/utils/useDeviceType";
import { getIpfsUrl } from "@/utils/function";
import { NFTMetadata } from "@/type/NFT";

interface HeroCarouselProps {
  categories: string[];
  items: NFTMetadata[];
}

const HeroCarousel = ({ categories, items }: HeroCarouselProps) => {
  const { isMobile, isTablet } = useDeviceType();
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  console.log("Pasted", items);

  useEffect(() => {
    if (isMobile) {
      setItemsPerPage(1);
    } else if (isTablet) {
      setItemsPerPage(2);
    } else {
      setItemsPerPage(4);
    }
  }, [isMobile, isTablet]);

  const previousPage = () => {
    setStartIndex((prev) => {
      if (prev === 0) {
        const remainder = items.length % itemsPerPage;
        return remainder === 0
          ? items.length - itemsPerPage
          : items.length - remainder;
      }
      return prev - itemsPerPage;
    });
  };

  const nextPage = () => {
    setStartIndex((prev) =>
      prev + itemsPerPage >= items.length ? 0 : prev + itemsPerPage
    );
  };

  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full relative">
      <Tabs defaultValue={categories[0].toLowerCase()} className="w-full mb-5">
        <TabsList className="w-full justify-start gap-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative flex items-center justify-between">
        <button
          onClick={previousPage}
          className="h-full w-12 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
          }}
        >
          {currentItems.map((item, index) => (
            <Card
              key={index}
              className="relative w-full h-80 bg-transparent border-none overflow-hidden group"
            >
              <Image
                src={getIpfsUrl(item.image)}
                alt={item.name || "NFT Image"}
                width={384}
                height={384}
                className="object-cover group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent " />

              <CardContent className="absolute bottom-0 left-0 w-full p-4">
                <h3 className="text-white font-medium">
                  {item.name || "Unknown"}
                </h3>
                <p className="text-white/60 text-sm">
                  Floor:{" "}
                  {item.attributes?.find((attr) => attr.trait_type === "Floor")
                    ?.value || "N/A"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <button
          onClick={nextPage}
          className="h-full w-12 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeroCarousel;

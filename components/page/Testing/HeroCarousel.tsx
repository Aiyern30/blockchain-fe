import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ChevronLeft, VerifiedIcon, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDeviceType } from "@/utils/useDeviceType";

// type Collection = {
//     rank:number,
//     name: string,
//     image: string,
//     verified:boolean,
//     floorPrice: string;
//     volume: string;
// }

type items = {
  title: string;
  floor: string;
  image: string;
  verified: boolean;
};

interface HeroCarouselProps {
  categories: string[];
  items: items[];
}

const HeroCarousel = ({ categories, items }: HeroCarouselProps) => {
  const { isMobile, isTablet } = useDeviceType();
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

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
    // setStartIndex((prev) =>
    //   prev === 0 ? items.length - itemsPerPage : prev - itemsPerPage
    // );
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
          className={cn(
            "h-full w-12",
            "flex items-center justify-center",
            "text-white  transition-opacity duration-300"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          className={`grid gap-4 w-full`}
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
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent " />

              <CardContent className="absolute bottom-0 left-0 w-full p-4 ">
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
            "text-white  transition-opacity duration-300"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HeroCarousel;

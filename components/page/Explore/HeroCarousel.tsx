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
import { useRouter } from "next/navigation";
import { extractCID } from "@/utils/function";

interface Collection {
  name: string;
  description?: string;
  floorPrice: string;
  image: string;
  id: string;
}

interface HeroCarouselProps {
  categories: string[];
  items: Collection[];
}

const HeroCarousel = ({ categories, items }: HeroCarouselProps) => {
  const router = useRouter();
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
          className="grid gap-6 w-full"
          style={{
            gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
          }}
        >
          {currentItems.map((item, index) => (
            <Card
              key={index}
              className="relative w-full overflow-hidden group rounded-2xl shadow-xl cursor-pointer flex flex-col items-center p-4 transition"
              onClick={() => {
                const collectionId = extractCID(item.id);
                console.log(collectionId);
                router.push(`/Explore/${collectionId}`);
              }}
            >
              <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={item.image}
                  alt={item.name || "Collection Image"}
                  width={300}
                  height={400}
                  className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>

              <CardContent className="w-full text-center mt-4">
                <h3 className="font-semibold text-lg truncate">
                  {item.name || "Unknown"}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Floor Price:{" "}
                  <span className="font-medium">
                    {item.floorPrice || "N/A"}
                  </span>
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

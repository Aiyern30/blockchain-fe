"use client";

import Image from "next/image";
import { VerifiedIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { useDeviceType } from "@/utils/useDeviceType";

const drawingItems = [
  {
    title: "Sketchy Doodles",
    floor: "0.1 ETH",
    volume: "190 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
  },
  {
    title: "Ink Wonders",
    floor: "0.2 ETH",
    volume: "360 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: false,
  },
  {
    title: "Pencil Perspectives",
    floor: "0.15 ETH",
    volume: "500 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
  },
  {
    title: "Charcoal Charm",
    floor: "0.18 ETH",
    volume: "280 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: false,
  },
  {
    title: "Graphite Genius",
    floor: "0.12 ETH",
    volume: "270 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "hp Computer",
    floor: "0.15 ETH",
    volume: "850 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "Peanut Butter",
    floor: "0.25 ETH",
    volume: "820 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
  },
  {
    title: "Bacon",
    floor: "0.3 ETH",
    volume: "590 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
  {
    title: "Doodle Dreams",
    floor: "0.2 ETH",
    volume: "290 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
  },
  {
    title: "GC Hero",
    floor: "0.5 ETH",
    volume: "350 ETH",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
    verified: true,
  },
];

export default function DrawingCarousel() {
  const { isMobile, isTablet } = useDeviceType();
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Adjust items per page based on device type
  useEffect(() => {
    if (isMobile) {
      setItemsPerPage(2);
    } else if (isTablet) {
      setItemsPerPage(4);
    } else {
      setItemsPerPage(6);
    }
  }, [isMobile, isTablet]);

  // Navigate to previous page of items
  const previousPage = () => {
    setStartIndex((prev) => {
      if (prev === 0) {
        const remainder = drawingItems.length % itemsPerPage;
        return remainder === 0
          ? drawingItems.length - itemsPerPage
          : drawingItems.length - remainder;
      }
      return prev - itemsPerPage;
    });
  };

  // Navigate to next page of items
  const nextPage = () => {
    setStartIndex((prev) =>
      prev + itemsPerPage >= drawingItems.length ? 0 : prev + itemsPerPage
    );
  };

  const currentItems = drawingItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <>
      <div className="w-full relative mt-10">
        <h2 className="text-white text-xl mt-5">Drawing</h2>
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

          <div
            className="grid gap-4 w-full mt-5"
            style={{
              gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
            }}
          >
            {currentItems.map((item, index) => (
              <Card
                key={index}
                //   className="border shadow-sm rounded-md overflow-hidden bg-white"
                //   className="relative bg-transparent border-none overflow-hidden group bg-white"
                className="flex flex-col w-full aspect-square bg-white border-none overflow-hidden"
              >
                {/* <div
                // className="relative w-full bg-transparent border-none overflow-hidden group"
                className="relative w-full object-cover absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
                style={{ aspectRatio: "1 / 1" }}
              > */}
                <div className="relative w-full h-[60%]">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    // className="object-cover absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
                    className="object-cover"
                  />
                </div>

                {/* <div className="relative w-full object-cover absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110" /> */}

                {/* <CardContent className="absolute bottom-0 left-0 w-full p-4 z-20"> */}
                <CardContent className="flex flex-col justify-between h-[40%] p-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {item.title}
                    </h3>
                    {item.verified && (
                      <VerifiedIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  {/* <p className="text-xs text-gray-500">Floor: {item.floor}</p>
                {item.volume && (
                  <p className="text-xs text-gray-500">
                    Total volume: {item.volume}
                  </p>
                )} */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Floor</span>
                      <span className="text-lg font-semibold text-gray-700">
                        {item.floor}
                      </span>
                    </div>

                    {item.volume && (
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-500">
                          Total volume
                        </span>
                        <span className="text-lg font-semibold text-gray-700">
                          {item.volume}
                        </span>
                      </div>
                    )}
                  </div>
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

      {/* Skeleton UI */}
      <div className="w-full relative mt-10">
        <h2 className="text-white text-xl mt-5">Drawing</h2>
        <div className="relative flex items-center justify-between">
          <button
            className={cn(
              "h-full w-12",
              "flex items-center justify-center",
              "text-white z-10 transition-opacity duration-300"
            )}
            disabled
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="grid gap-4 w-full mt-5"
            style={{
              gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Skeleton
                key={index}
                className="flex flex-col w-full aspect-square border-none overflow-hidden"
              >
                <div className="relative w-full h-[60%]">
                  <Skeleton className="absolute inset-0 w-full h-full" />
                </div>
                <div className="flex flex-col justify-between h-[40%] p-3">
                  <Skeleton className="w-2/3 h-4 mb-2" />
                  <div className="flex justify-between items-start">
                    <Skeleton className="w-16 h-6" />
                    <Skeleton className="w-16 h-6" />
                  </div>
                </div>
              </Skeleton>
            ))}
          </div>

          <button
            className={cn(
              "h-full w-12",
              "flex items-center justify-center",
              "text-white z-10 transition-opacity duration-300"
            )}
            disabled
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}

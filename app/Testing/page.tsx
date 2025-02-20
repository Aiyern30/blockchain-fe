"use client";

import Image from "next/image";
import {
  VerifiedIcon,
  ChevronLeft,
  ChevronRight,
  BadgeCheckIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useDeviceType } from "@/utils/useDeviceType";

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
  // Add more collections as needed
];
export default function NFTCarousel() {
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
    <>
      <div className="w-full relative">
        <Tabs
          defaultValue={categories[0].toLowerCase()}
          className="w-full mb-5"
        >
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
              "text-white z-10 transition-opacity duration-300"
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

      <div className="flex items-center justify-center gap-5 mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Rank</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Floor Price</TableHead>
              <TableHead>Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.rank} className=" cursor-pointer h-16">
                <TableCell className="font-medium text-center">
                  {collection.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={collection.image || "/placeholder.svg"}
                        alt={collection.name}
                        className="rounded-full"
                        fill
                      />
                    </div>
                    <span className="font-medium">{collection.name}</span>
                    {collection.verified && (
                      <span className="text-blue-500">
                        <BadgeCheckIcon className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{collection.floorPrice} ETH</TableCell>
                <TableCell>{collection.volume} ETH</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Rank</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Floor Price</TableHead>
              <TableHead>Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.rank} className=" cursor-pointer h-16">
                <TableCell className="font-medium text-center">
                  {collection.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={collection.image || "/placeholder.svg"}
                        alt={collection.name}
                        className="rounded-full"
                        fill
                      />
                    </div>
                    <span className="font-medium">{collection.name}</span>
                    {collection.verified && (
                      <span className="text-blue-500">
                        <BadgeCheckIcon className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{collection.floorPrice} ETH</TableCell>
                <TableCell>{collection.volume} ETH</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

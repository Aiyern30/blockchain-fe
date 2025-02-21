"use client";

import { useState, Suspense } from "react";
import { Share2, Globe, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { NFTGrid } from "./nft-grid";
import { CollectionStats } from "./collection-stats";
import { ActivityTable } from "./activity-table";
import { FilterSection } from "./filter-section";
import { FaListUl } from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import { IoMdGrid } from "react-icons/io";
import { BsGrid1X2 } from "react-icons/bs";

const collection = {
  name: "Bored Ape Yacht Club",
  description:
    "The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.",
  bannerUrl:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
  profileUrl:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
  owner: "BoredApeYachtClub",
  items: 10000,
  owners: 6400,
  floorPrice: 27.95,
  volumeTraded: 850123,
};

export default function CollectionPage() {
  const [gridView, setGridView] = useState<
    "list" | "small" | "medium" | "large"
  >("medium");

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-[300px] w-full">
        <Image
          src={
            collection.bannerUrl ||
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
          }
          alt="Collection Banner"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div className="relative mx-auto px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <div className="relative -mt-24 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <Image
              src={
                collection.profileUrl ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
              }
              alt={collection.name}
              fill
              className="rounded-xl border-4 border-background bg-background object-cover"
            />
          </div>

          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
              <h1 className="truncate text-2xl font-bold text-foreground">
                {collection.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                by{" "}
                <span className="font-medium text-primary">
                  {collection.owner}
                </span>
              </p>
            </div>
            <div className="flex justify-stretch space-x-3 sm:mt-0">
              <Button variant="outline" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <CollectionStats collection={collection} />

        {/* Description */}
        <div className="mt-6 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            {collection.description}
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="items" className="mt-8">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button
                onClick={() => setGridView("list")}
                className={`rounded-md border px-4 py-2 ${
                  gridView === "list"
                    ? "bg-orange-300 hover:bg-orange-800"
                    : "hover:bg-blue-800"
                }`}
                size="icon"
              >
                <FaListUl className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setGridView("small")}
                className={`rounded-md border px-4 py-2 ${
                  gridView === "small"
                    ? "bg-orange-300 hover:bg-orange-800"
                    : "hover:bg-blue-800"
                }`}
                size="icon"
              >
                <IoGridOutline className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setGridView("medium")}
                className={`rounded-md border px-4 py-2 ${
                  gridView === "medium"
                    ? "bg-orange-300 hover:bg-orange-800"
                    : "hover:bg-blue-800"
                }`}
                size="icon"
              >
                <IoMdGrid className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setGridView("large")}
                className={`rounded-md border px-4 py-2 ${
                  gridView === "large"
                    ? "bg-orange-300 hover:bg-orange-800"
                    : "hover:bg-blue-800"
                }`}
                size="icon"
              >
                <BsGrid1X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-6">
            {/* Filters */}
            <div className="col-span-12 lg:col-span-3">
              <FilterSection />
            </div>

            {/* Content */}
            <div className="col-span-12 lg:col-span-9">
              <TabsContent value="items" className="mt-0">
                <Suspense fallback={<div>Loading...</div>}>
                  <NFTGrid view={gridView} />
                </Suspense>
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                <Suspense fallback={<div>Loading...</div>}>
                  <ActivityTable />
                </Suspense>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </main>
  );
}

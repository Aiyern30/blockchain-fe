"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { NFTGrid } from "./nft-grid";
// import { CollectionStats } from "./collection-stats";
import { ActivityTable } from "./activity-table";
import { FilterSection } from "./filter-section";
import { GridView } from "@/type/view";
import { ViewSelector } from "@/components/ViewSelector";
import { fetchNFTsByCollectionID } from "@/utils/fetchAllNFTsByCID";

interface NFTAttribute {
  type: string;
  name: string;
}

interface NFT {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTAttribute[];
  collectionCID: string;
}

export default function CollectionPage() {
  const [gridView, setGridView] = useState<GridView>("medium");
  const [nfts, setNfts] = useState<NFT[]>([]);
  console.log("NFTs:", nfts);
  const params = useParams();
  const collectionId = params.id as string;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedView = localStorage.getItem("nft-grid-view") as GridView;
      if (storedView) {
        setGridView(storedView);
      }
    }
  }, []);

  useEffect(() => {
    if (collectionId) {
      console.log("Collection ID from URL:", collectionId);

      fetchNFTsByCollectionID(collectionId)
        .then((fetchedNFTs) => {
          console.log("Fetched NFTs:", fetchedNFTs);
          setNfts(fetchedNFTs);
        })
        .catch((error) => {
          console.error("Error fetching NFTs for collection:", error);
        });
    }
  }, [collectionId]);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-[300px] w-full">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
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
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
              alt="Collection"
              fill
              className="rounded-xl border-4 border-background bg-background object-cover"
            />
          </div>
        </div>

        {/* <CollectionStats collection={{ name: "Loading...", ...nfts }} /> */}

        <Tabs defaultValue="items" className="mt-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-400">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <ViewSelector view={gridView} onChange={setGridView} />
          </div>

          <div className="mt-4 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <FilterSection />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <TabsContent value="items" className="mt-0">
                <Suspense fallback={<div>Loading...</div>}>
                  <NFTGrid view={gridView} nfts={nfts} />
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

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
import DrawingCarousel from "./DrawingCarousel";
// import CryptoTable from "@/components/page/Explore/CryptoTable";

const timeFrames = ["1h", "6h", "24h", "7d"];

export default function NFTCarousel() {
  const { isMobile } = useDeviceType();

  return (
    <>
      <div
        className={cn(
          "mt-5 space-y-4",
          isMobile ? "flex flex-col" : "flex justify-between items-center"
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

      {/* <CryptoTable collections={collections} shouldSplit={collections.length > 5} /> */}
      <DrawingCarousel />
    </>
  );
}

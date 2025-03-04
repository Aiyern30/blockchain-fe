import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  Skeleton,
} from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CarouselSkeleton = ({ itemsPerPage = 4 }) => {
  return (
    <div className="w-full relative">
      <Tabs defaultValue="category-1" className="w-full mb-5">
        <TabsList className="w-full justify-start gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <TabsTrigger key={index} value={`category-${index + 1}`}>
              <Skeleton className="h-10 w-24 rounded-md" />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative flex items-center justify-between">
        {/* Left Button */}
        <button className="h-full w-12 flex items-center justify-center text-white opacity-50">
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Skeleton NFT Cards */}
        <div
          className="grid gap-6 w-full"
          style={{
            gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card
              key={index}
              className="relative w-full overflow-hidden rounded-lg shadow-lg"
            >
              <div className="relative w-full max-w-[300px] aspect-[3/4] mx-auto">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
              <CardContent className="absolute bottom-0 left-0 w-full p-4">
                <Skeleton className="h-5 w-3/4 rounded-md mb-2" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Button */}
        <button className="h-full w-12 flex items-center justify-center text-white opacity-50">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

import { ChevronLeft, ChevronRight } from "lucide-react";

export const CarouselSkeleton = ({ itemsPerPage = 4 }) => {
  return (
    <div className="w-full relative">
      <div className="w-full mb-5 flex gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-24 bg-gray-700 rounded-md animate-pulse"
          />
        ))}
      </div>

      <div className="relative flex items-center justify-between">
        <button className="h-full w-12 flex items-center justify-center text-white opacity-50">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <div
              key={index}
              className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="absolute inset-0 bg-gray-700" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-4">
                <div className="h-5 w-3/4 bg-gray-600 rounded-md mb-2" />
                <div className="h-4 w-1/3 bg-gray-700 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <button className="h-full w-12 flex items-center justify-center text-white opacity-50">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

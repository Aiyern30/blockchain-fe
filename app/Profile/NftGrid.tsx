import type { GridView } from "@/type/view";
import { NFTItem, NFTCard } from "./NftCard";
import { NFTListItem } from "./NftListItem";

interface NFTGridProps {
  items: NFTItem[];
  view: GridView;
}

export function NFTGrid({ items, view }: NFTGridProps) {
  if (view === "list") {
    return (
      <div className="mt-6 space-y-1">
        {items.map((item) => (
          <NFTListItem key={item.id} nft={item} />
        ))}
      </div>
    );
  }

  const gridClasses = {
    small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`mt-6 grid ${gridClasses[view]} gap-4`}>
      {items.map((item) => (
        <NFTCard key={item.id} nft={item} size={view} />
      ))}
    </div>
  );
}

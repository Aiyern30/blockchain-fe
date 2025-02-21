import { Card, CardContent } from "@/components/ui";

interface CollectionStatsProps {
  collection: {
    items: number;
    owners: number;
    floorPrice: number;
    volumeTraded: number;
  };
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Items</p>
          <p className="text-2xl font-bold">
            {collection.items.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Owners</p>
          <p className="text-2xl font-bold">
            {collection.owners.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Floor Price</p>
          <p className="text-2xl font-bold">{collection.floorPrice} ETH</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Volume Traded</p>
          <p className="text-2xl font-bold">
            {collection.volumeTraded.toLocaleString()} ETH
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

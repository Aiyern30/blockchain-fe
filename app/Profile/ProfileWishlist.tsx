"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Heart } from "lucide-react";
import {
  Button,
  Card,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
} from "@/components/ui";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatImageUrl } from "@/utils/function";
import type { GridView } from "@/type/view";
import CardEmptyUI from "@/components/CardEmptyUI";

export function ProfileWishlist({ view }: { view: GridView }) {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);
  console.log("Wishlist Items:", hoverIndex);

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
        <CardEmptyUI
          title="Your Wishlist is empty!"
          description="Add some awesome NFTs to your wishlist!"
          buttonText="Explore NFTs"
          type="wishlist"
        />
      </div>
    );
  }

  // Determine grid columns based on view
  const gridColumns = {
    small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    list: "",
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold">
            Your Wishlist ({wishlistItems.length} item
            {wishlistItems.length !== 1 && "s"})
          </h2>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will remove all items from
                your wishlist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearWishlist}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {view === "list" ? (
        <div className="space-y-2">
          {wishlistItems.map((item) => (
            <div
              key={`${item.tokenId}-${item.owner}`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              onMouseEnter={() =>
                setHoverIndex(`${item.tokenId}-${item.owner}`)
              }
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                  <Image
                    src={
                      formatImageUrl(item.metadata?.image || "") ||
                      "/placeholder.svg"
                    }
                    alt={item.metadata?.name || `NFT #${item.tokenId}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">
                    {item.metadata?.name || `NFT #${item.tokenId}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Token ID: {item.tokenId}
                  </p>
                  {item.metadata?.price && (
                    <p className="text-sm font-medium">
                      {item.metadata.price} ETH
                    </p>
                  )}
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove{" "}
                      <span className="font-semibold">
                        {item.metadata?.name || `NFT #${item.tokenId}`}
                      </span>{" "}
                      from your wishlist?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeFromWishlist(item)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColumns[view]} gap-4`}>
          {wishlistItems.map((item) => (
            <Card
              key={`${item.tokenId}-${item.owner}`}
              className="overflow-hidden relative group"
              onMouseEnter={() =>
                setHoverIndex(`${item.tokenId}-${item.owner}`)
              }
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={
                    formatImageUrl(item.metadata?.image || "") ||
                    "/placeholder.svg"
                  }
                  alt={item.metadata?.name || `NFT #${item.tokenId}`}
                  fill
                  className="object-cover"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">
                          {item.metadata?.name || `NFT #${item.tokenId}`}
                        </span>{" "}
                        from your wishlist?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeFromWishlist(item)}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {item.metadata?.price && (
                  <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm">
                    {item.metadata.price} ETH
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">
                  {item.metadata?.name || `NFT #${item.tokenId}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Token ID: {item.tokenId}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="lg" className="gap-2">
          <Heart className="h-4 w-4 fill-current" />
          Add more to wishlist
        </Button>
      </div>
    </div>
  );
}

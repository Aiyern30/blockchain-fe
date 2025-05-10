"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  ScrollArea,
} from "@/components/ui";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatImageUrl } from "@/utils/function";
import CardEmptyUI from "@/components/CardEmptyUI";

export function WishlistSheet() {
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } =
    useWishlist();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {wishlistCount}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="w-[380px] sm:w-[400px] flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <SheetHeader>
            <SheetTitle>Your Wishlist</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto">
          {wishlistItems.length > 0 ? (
            <>
              <div className="px-6 pt-0 pb-4 border-b flex items-center justify-between">
                <span>
                  {wishlistItems.length} item{wishlistItems.length !== 1 && "s"}
                </span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">Clear all</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will remove all items
                        from your wishlist.
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

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="px-6 py-4 space-y-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={`${item.tokenId}-${item.owner}`}
                      className="flex items-center gap-4 border-b pb-3"
                    >
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
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {item.metadata?.name || `NFT #${item.tokenId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Token ID: {item.tokenId}
                        </p>
                        {item.metadata?.price && (
                          <p className="text-xs font-medium">
                            {item.metadata.price} ETH
                          </p>
                        )}
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
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
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <CardEmptyUI
              title="Your Wishlist is empty!"
              description="Add some awesome NFTs to your wishlist!"
              buttonText="Explore NFTs"
              type="wishlist"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default WishlistSheet;

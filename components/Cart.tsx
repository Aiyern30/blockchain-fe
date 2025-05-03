"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ScrollArea,
  Separator,
} from "@/components/ui";
import { ShoppingCart, Trash2 } from "lucide-react";
import { formatImageUrl } from "@/utils/function";
import { useCart } from "@/hooks/use-cart";

export function CartSheet() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    cartCount,
    totalPrice,
    getTotalPriceInCurrency,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);
  const [localCartCount, setLocalCartCount] = useState(0);

  // Update local cart count whenever the cartCount changes
  useEffect(() => {
    setLocalCartCount(cartCount);
  }, [cartCount]);

  // Calculate USD and MYR prices using currency context
  const usdPrice = getTotalPriceInCurrency("USD");
  const myrPrice = getTotalPriceInCurrency("MYR");

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          <Button variant="outline" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          {localCartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {localCartCount}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="w-[380px] sm:w-[400px] flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <SheetHeader>
            <SheetTitle>Your cart</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto">
          {cartItems.length > 0 ? (
            <>
              <div className="px-6 pt-0 pb-4 border-b flex items-center justify-between">
                <span>
                  {cartItems.length} item{cartItems.length !== 1 && "s"}
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
                        from your cart.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearCart}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="px-6 py-4 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.tokenId}-${item.owner}`}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg transition relative hover:bg-muted"
                      onMouseEnter={() =>
                        setHoverIndex(`${item.tokenId}-${item.owner}`)
                      }
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <div className="flex items-center gap-3">
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
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate max-w-[150px]">
                            {item.metadata?.name || `NFT #${item.tokenId}`}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Token ID: {item.tokenId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hoverIndex === `${item.tokenId}-${item.owner}` ? (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <p className="font-medium">
                            {item.metadata?.price || "0.00"} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="relative w-[200px] h-[200px]">
                <Image
                  src="/placeholder.svg"
                  alt="Empty Cart"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Your cart is empty!
              </h3>
              <p className="text-muted-foreground mb-4">
                Add some awesome NFTs to your cart!
              </p>
              <Button variant="default" onClick={() => setIsOpen(false)}>
                Explore NFTs
              </Button>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg">Total price</span>
              <div className="text-right">
                <div className="text-lg">{totalPrice.toFixed(3)} ETH</div>
                <div className="text-sm text-muted-foreground">
                  ${usdPrice.toFixed(2)} USD
                </div>
                <div className="text-xs text-muted-foreground">
                  RM {myrPrice.toFixed(2)} MYR
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <Button className="w-full">Complete purchase</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

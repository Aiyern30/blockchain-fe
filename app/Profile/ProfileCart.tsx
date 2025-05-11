"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
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
  Separator,
} from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { formatImageUrl } from "@/utils/function";
import CardEmptyUI from "@/components/CardEmptyUI";
import { useFilter } from "@/contexts/filter-context";

export function ProfileCart() {
  const {
    cartItems,
    removeFromCart,
    clearCart,

    getTotalPriceInCurrency,
  } = useCart();
  const { filter } = useFilter();
  const { view, searchQuery } = filter;

  const [hoverIndex, setHoverIndex] = useState<string | null>(null);
  console.log("hoverIndex", hoverIndex);
  // Filter cart items based on search query
  const filteredCartItems = useMemo(() => {
    if (!searchQuery) return cartItems;

    const query = searchQuery.toLowerCase();
    return cartItems.filter(
      (item) =>
        (item.metadata?.name || "").toLowerCase().includes(query) ||
        item.tokenId.toString().includes(query) ||
        (item.owner || "").toLowerCase().includes(query)
    );
  }, [cartItems, searchQuery]);

  // Calculate USD and MYR prices using currency context
  const usdPrice = getTotalPriceInCurrency("USD");
  const myrPrice = getTotalPriceInCurrency("MYR");

  // Calculate filtered items total price
  const filteredTotalPrice = useMemo(() => {
    return filteredCartItems.reduce((acc, item) => {
      const price = parseFloat(item.metadata?.price || "0");
      return acc + price;
    }, 0);
  }, [filteredCartItems]);

  // Display empty state if no cart items match the search
  if (filteredCartItems.length === 0) {
    // Show different message if cart is empty vs no search results
    if (cartItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
          <CardEmptyUI
            title="Your cart is empty!"
            description="Add some awesome NFTs to your cart!"
            buttonText="Explore NFTs"
            type="cart"
          />
        </div>
      );
    } else {
      // Show message for no search results
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
          <div className="p-8 rounded-lg border max-w-md">
            <h3 className="text-xl font-semibold mb-2">No matching items</h3>
            <p className="text-muted-foreground mb-4">
              No items in your cart match your search criteria. Try adjusting
              your search.
            </p>
          </div>
        </div>
      );
    }
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
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            Your Cart ({filteredCartItems.length} of {cartItems.length} item
            {cartItems.length !== 1 && "s"})
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
                your cart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearCart}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {view === "list" ? (
        <div className="space-y-2">
          {filteredCartItems.map((item) => (
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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-medium">
                  {item.metadata?.price || "0.00"} ETH
                </p>
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
                        from your cart?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeFromCart(item)}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColumns[view]} gap-4`}>
          {filteredCartItems.map((item) => (
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
                        from your cart?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeFromCart(item)}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate">
                  {item.metadata?.name || `NFT #${item.tokenId}`}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    Token ID: {item.tokenId}
                  </p>
                  <p className="font-medium">
                    {item.metadata?.price || "0.00"} ETH
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Order Summary</h3>
            <p className="text-sm text-muted-foreground">
              {filteredCartItems.length} item
              {filteredCartItems.length !== 1 && "s"} in your cart{" "}
              {searchQuery && filteredCartItems.length !== cartItems.length
                ? `(filtered from ${cartItems.length})`
                : ""}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg w-full sm:w-auto sm:min-w-[200px]">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-medium">
                {typeof filteredTotalPrice === "number"
                  ? filteredTotalPrice.toFixed(3)
                  : "0.000"}{" "}
                ETH
              </span>
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              <div className="flex justify-between">
                <span>USD Price</span>
                <span>${usdPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>MYR Price</span>
                <span>RM {myrPrice.toFixed(2)}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {typeof filteredTotalPrice === "number"
                  ? filteredTotalPrice.toFixed(3)
                  : "0.000"}{" "}
                ETH
              </span>
            </div>
            <Button className="w-full mt-4">Complete Purchase</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

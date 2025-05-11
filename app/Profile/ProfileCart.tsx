"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Trash2, ShoppingBag } from "lucide-react";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
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
  Skeleton,
} from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { formatImageUrl, truncateAddress } from "@/utils/function";
import CardEmptyUI from "@/components/CardEmptyUI";
import { useFilter } from "@/contexts/filter-context";

export function ProfileCart() {
  const { cartItems, removeFromCart, clearCart, getTotalPriceInCurrency } =
    useCart();
  const { filter } = useFilter();
  const { view, searchQuery } = filter;

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  // Determine grid columns based on view (matching the collection component)
  const gridColumns = {
    small:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    list: "",
  };

  // Loading skeletons
  if (isLoading) {
    if (view === "list") {
      return (
        <div className="mt-6 w-full space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b animate-pulse w-full"
              >
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
        </div>
      );
    }

    return (
      <div className={`mt-6 grid ${gridColumns[view]} gap-4`}>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden cursor-pointer animate-pulse border hover:border-primary hover:shadow-lg transition-shadow w-64"
            >
              <div className="relative h-44 w-full bg-muted">
                <Skeleton className="h-full w-full absolute inset-0" />
              </div>

              <CardHeader className="space-y-1 pb-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>

              <CardFooter className="pt-1 pb-3 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-6" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  // Empty states
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

  return (
    <div className="mt-6 w-full">
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
        <div className="space-y-2 w-full">
          {filteredCartItems.map((item) => (
            <div
              key={`${item.tokenId}-${item.owner}`}
              className="flex w-full items-center justify-between border rounded-lg px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-5 w-full">
                <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted shrink-0">
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
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-medium text-base truncate">
                      {item.metadata?.name || `NFT #${item.tokenId}`}
                    </h3>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      {item.metadata?.price || "0.00"} ETH
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.metadata?.description || "No description provided"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Token ID: {item.tokenId}
                    {item.owner && (
                      <span className="ml-2">
                        Owner:{" "}
                        <span className="font-mono">
                          {truncateAddress(item.owner)}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50"
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
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColumns[view]} gap-4`}>
          {filteredCartItems.map((item) => (
            <Card
              key={`${item.tokenId}-${item.owner}`}
              className="overflow-hidden hover:shadow-lg transition-shadow border hover:border-primary"
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
              <CardHeader className="space-y-1 pb-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold truncate">
                    {item.metadata?.name || `NFT #${item.tokenId}`}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {item.metadata?.price || "0.00"} ETH
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {item.metadata?.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-1 pb-3 text-xs text-muted-foreground flex justify-between items-center">
                <div className="truncate">Token ID: {item.tokenId}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Order Summary - Keep this separate from the view type */}
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

          <div className="bg-muted p-4 rounded-lg w-full sm:w-auto sm:min-w-[250px]">
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

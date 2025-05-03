"use client";

import type React from "react";

import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui";
import type { CollectionNFT } from "@/type/CollectionNFT";

interface NFTActionButtonsProps {
  nft: CollectionNFT;
  isInWishlist: boolean;
  isInCart: boolean;
  onAddToWishlist: () => void;
  onRemoveFromWishlist: () => void;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onBuyNow: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "default";
  className?: string;
}

export function NFTActionButtons({
  isInWishlist,
  isInCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
  size = "default",
  className = "",
}: NFTActionButtonsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        size={size}
        variant={isInWishlist ? "default" : "secondary"}
        className={isInWishlist ? "bg-red-500 hover:bg-red-600" : ""}
        onClick={(e) => {
          e.stopPropagation();
          if (isInWishlist) {
            onRemoveFromWishlist();
          } else {
            onAddToWishlist();
          }
        }}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-white" : ""}`} />
      </Button>

      <Button
        size={size}
        variant={isInCart ? "default" : "secondary"}
        className={isInCart ? "bg-blue-500 hover:bg-blue-600" : ""}
        onClick={(e) => {
          e.stopPropagation();
          if (isInCart) {
            onRemoveFromCart();
          } else {
            onAddToCart();
          }
        }}
        title={isInCart ? "Remove from cart" : "Add to cart"}
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>

      <Button
        size={size}
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          onBuyNow(e);
        }}
        title="Buy now"
      >
        <CreditCard className="h-4 w-4 mr-1" />
        {size === "default" && "Buy"}
      </Button>
    </div>
  );
}

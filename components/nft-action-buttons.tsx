"use client";

import type React from "react";

import { Heart, ShoppingCart, CreditCard, AlertCircle } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { toast } from "sonner";
import { isNFTListed } from "@/utils/nft-status";

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
  nft,
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
  // Use the utility function to determine if the NFT is listed
  const isListed = isNFTListed(nft);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isListed && !isInWishlist) {
      toast.error("You can only add listed NFTs to your wishlist");
      return;
    }

    if (isInWishlist) {
      onRemoveFromWishlist();
    } else {
      onAddToWishlist();
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isListed && !isInCart) {
      toast.error("You can only add listed NFTs to your cart");
      return;
    }

    if (isInCart) {
      onRemoveFromCart();
    } else {
      onAddToCart();
    }
  };

  const handleBuyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isListed) {
      toast.error("This NFT is not listed for sale");
      return;
    }

    onBuyNow(e);
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant={isInWishlist ? "default" : "secondary"}
              className={isInWishlist ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={handleWishlistClick}
              disabled={!isListed && !isInWishlist}
            >
              <Heart
                className={`h-4 w-4 ${isInWishlist ? "fill-white" : ""}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!isListed
              ? "NFT not listed for sale"
              : isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant={isInCart ? "default" : "secondary"}
              className={isInCart ? "bg-blue-500 hover:bg-blue-600" : ""}
              onClick={handleCartClick}
              disabled={!isListed && !isInCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!isListed
              ? "NFT not listed for sale"
              : isInCart
              ? "Remove from cart"
              : "Add to cart"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant="default"
              onClick={handleBuyClick}
              disabled={!isListed}
            >
              {isListed ? (
                <>
                  <CreditCard className="h-4 w-4 mr-1" />
                  {size === "default" && "Buy"}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {size === "default" && "Not for sale"}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isListed ? "Buy this NFT now" : "This NFT is not for sale"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

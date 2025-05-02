"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { WishlistItem } from "@/type/cart-wishlist";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem("nft-wishlist");
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nft-wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = (nft: CollectionNFT) => {
    // Check if NFT is already in wishlist
    const exists = wishlistItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );

    if (exists) {
      toast.info("NFT is already in your wishlist");
      return;
    }

    const wishlistItem: WishlistItem = {
      ...nft,
      addedAt: Date.now(),
    };

    setWishlistItems((prev) => [...prev, wishlistItem]);
    toast.success("Added to wishlist", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been added to your wishlist`,
    });
  };

  const removeFromWishlist = (nft: CollectionNFT) => {
    setWishlistItems((prev) =>
      prev.filter(
        (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
      )
    );
    toast.success("Removed from wishlist", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been removed from your wishlist`,
    });
  };

  const isInWishlist = (nft: CollectionNFT) => {
    return wishlistItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success("Wishlist cleared");
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
  };
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { WishlistItem } from "@/type/cart-wishlist";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { currencyRates } = useCurrency();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem("nft-wishlist");
    if (storedWishlist) {
      try {
        const items = JSON.parse(storedWishlist);
        setWishlistItems(items);
        setWishlistCount(items.length);
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
      setWishlistCount(wishlistItems.length);
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
    setWishlistCount((prev) => prev + 1);
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
    setWishlistCount((prev) => prev - 1);
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
    setWishlistCount(0);
    toast.success("Wishlist cleared");
  };

  const getTotalPrice = () => {
    return wishlistItems.reduce((total, item) => {
      // If the NFT has a price, use it, otherwise default to 0
      const price = item.metadata?.price ? item.metadata.price : 0;
      return total + price;
    }, 0);
  };

  const getTotalPriceInCurrency = (currency: string) => {
    const totalEth = getTotalPrice();
    return totalEth * (currencyRates[currency] || 0);
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
    totalPrice: getTotalPrice(),
    getTotalPriceInCurrency,
  };
}

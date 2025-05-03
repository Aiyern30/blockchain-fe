"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { WishlistItem } from "@/type/cart-wishlist";

// Define a proper type for the listener function
type WishlistUpdateListener = (items: WishlistItem[]) => void;

// Create a simple global state for wishlist count
let globalWishlistItems: WishlistItem[] = [];
let globalWishlistListeners: WishlistUpdateListener[] = [];

// Function to notify all listeners of wishlist changes
const notifyWishlistListeners = () => {
  globalWishlistListeners.forEach((listener) => listener(globalWishlistItems));
};

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { currencyRates } = useCurrency();

  // Load wishlist from localStorage on mount and subscribe to changes
  useEffect(() => {
    // Initial load from localStorage
    const loadFromStorage = () => {
      const storedWishlist = localStorage.getItem("nft-wishlist");
      if (storedWishlist) {
        try {
          const items = JSON.parse(storedWishlist);
          globalWishlistItems = items;
          setWishlistItems(items);
          setWishlistCount(items.length);
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage:", error);
        }
      }
    };

    // Load initial data
    loadFromStorage();

    // Add listener for updates
    const handleWishlistUpdate: WishlistUpdateListener = (items) => {
      setWishlistItems([...items]);
      setWishlistCount(items.length);
    };

    globalWishlistListeners.push(handleWishlistUpdate);

    // Clean up listener on unmount
    return () => {
      globalWishlistListeners = globalWishlistListeners.filter(
        (listener) => listener !== handleWishlistUpdate
      );
    };
  }, []);

  const addToWishlist = useCallback((nft: CollectionNFT) => {
    const exists = globalWishlistItems.some(
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

    // Update global state
    globalWishlistItems = [...globalWishlistItems, wishlistItem];

    // Update localStorage
    localStorage.setItem("nft-wishlist", JSON.stringify(globalWishlistItems));

    // Notify all listeners
    notifyWishlistListeners();

    toast.success("Added to wishlist", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been added to your wishlist`,
    });
  }, []);

  const removeFromWishlist = useCallback((nft: CollectionNFT) => {
    // Update global state
    globalWishlistItems = globalWishlistItems.filter(
      (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
    );

    // Update localStorage
    localStorage.setItem("nft-wishlist", JSON.stringify(globalWishlistItems));

    // Notify all listeners
    notifyWishlistListeners();

    toast.success("Removed from wishlist", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been removed from your wishlist`,
    });
  }, []);

  const isInWishlist = useCallback((nft: CollectionNFT) => {
    return globalWishlistItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );
  }, []);

  const clearWishlist = useCallback(() => {
    // Update global state
    globalWishlistItems = [];

    // Update localStorage
    localStorage.setItem("nft-wishlist", JSON.stringify([]));

    // Notify all listeners
    notifyWishlistListeners();

    toast.success("Wishlist cleared");
  }, []);

  const getTotalPrice = useCallback(() => {
    return wishlistItems.reduce((total, item) => {
      // If the NFT has a price, use it, otherwise default to 0
      const price = item.metadata?.price ? item.metadata.price : 0;
      return total + price;
    }, 0);
  }, [wishlistItems]);

  const getTotalPriceInCurrency = useCallback(
    (currency: string) => {
      const totalEth = getTotalPrice();
      return totalEth * (currencyRates[currency] || 0);
    },
    [getTotalPrice, currencyRates]
  );

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

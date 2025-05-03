"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { WishlistItem } from "@/type/cart-wishlist";

// Create a custom event for wishlist updates
const WISHLIST_UPDATE_EVENT = "wishlist-update";

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

    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
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
    };

    window.addEventListener(WISHLIST_UPDATE_EVENT, handleWishlistUpdate);
    return () => {
      window.removeEventListener(WISHLIST_UPDATE_EVENT, handleWishlistUpdate);
    };
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nft-wishlist", JSON.stringify(wishlistItems));
      setWishlistCount(wishlistItems.length);

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(WISHLIST_UPDATE_EVENT));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = useCallback((nft: CollectionNFT) => {
    setWishlistItems((prev) => {
      const exists = prev.some(
        (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
      );

      if (exists) {
        toast.info("NFT is already in your wishlist");
        return prev;
      }

      const wishlistItem: WishlistItem = {
        ...nft,
        addedAt: Date.now(),
      };

      toast.success("Added to wishlist", {
        description: `${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        } has been added to your wishlist`,
      });

      const newItems = [...prev, wishlistItem];

      // Update localStorage directly to ensure immediate updates across components
      localStorage.setItem("nft-wishlist", JSON.stringify(newItems));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(WISHLIST_UPDATE_EVENT));

      return newItems;
    });
  }, []);

  const removeFromWishlist = useCallback((nft: CollectionNFT) => {
    setWishlistItems((prev) => {
      const newItems = prev.filter(
        (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
      );

      toast.success("Removed from wishlist", {
        description: `${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        } has been removed from your wishlist`,
      });

      // Update localStorage directly to ensure immediate updates across components
      localStorage.setItem("nft-wishlist", JSON.stringify(newItems));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(WISHLIST_UPDATE_EVENT));

      return newItems;
    });
  }, []);

  const isInWishlist = useCallback(
    (nft: CollectionNFT) => {
      return wishlistItems.some(
        (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
      );
    },
    [wishlistItems]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);

    // Update localStorage directly to ensure immediate updates across components
    localStorage.setItem("nft-wishlist", JSON.stringify([]));

    // Dispatch event to notify other components
    window.dispatchEvent(new Event(WISHLIST_UPDATE_EVENT));

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

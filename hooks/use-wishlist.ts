"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { WishlistItem } from "@/type/cart-wishlist";
import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";

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
  const { data: walletClient } = useWalletClient();

  // First, load wishlist directly from localStorage on mount to show items immediately
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

  // Then, in a separate effect, enhance wishlist items with blockchain data and validate
  useEffect(() => {
    const enhanceWishlistWithBlockchainData = async () => {
      if (!walletClient) return;

      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const nftContract = getERC721Contract(signer);

        // Fetch NFTs from contract
        const allMarketItems: CollectionNFT[] =
          await nftContract.fetchMarketItems({
            from: signerAddress,
            gasLimit: ethers.parseUnits("500000", "wei"),
          });

        // Get stored wishlist items from localStorage
        const storedWishlist = localStorage.getItem("nft-wishlist");
        if (!storedWishlist) return;

        let storedWishlistItems: WishlistItem[] = [];
        try {
          storedWishlistItems = JSON.parse(storedWishlist);
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage:", error);
          return;
        }

        // Create a map of token IDs and owners for faster lookup
        const marketItemsMap = new Map<string, CollectionNFT>();
        allMarketItems.forEach((item) => {
          const key = `${item.tokenId}-${item.owner}`;
          marketItemsMap.set(key, item);
        });

        // Keep valid items and enhance them with blockchain data
        const validItems: WishlistItem[] = [];
        let removedItemsCount = 0;

        storedWishlistItems.forEach((item) => {
          const key = `${item.tokenId}-${item.owner}`;
          const matchingMarketItem = marketItemsMap.get(key);

          if (matchingMarketItem) {
            // NFT still exists, enhance it with blockchain data
            validItems.push({
              ...matchingMarketItem,
              addedAt: item.addedAt,
            });
          } else {
            // NFT no longer exists (possibly burned or transferred)
            removedItemsCount++;
          }
        });

        // If some items were removed, update localStorage and notify
        if (removedItemsCount > 0) {
          globalWishlistItems = validItems;
          localStorage.setItem("nft-wishlist", JSON.stringify(validItems));

          // Show a notification
          toast.info(
            `Removed ${removedItemsCount} item${
              removedItemsCount !== 1 ? "s" : ""
            } that no longer exist`,
            {
              description:
                "Some NFTs in your wishlist may have been burned or transferred",
            }
          );
        }

        setWishlistItems(validItems);
        setWishlistCount(validItems.length);
        notifyWishlistListeners();
      } catch (error) {
        console.error("Failed to fetch collection data:", error);
        toast.error("Failed to load collection data");
        // Important: Don't clear the wishlist on error!
      }
    };

    enhanceWishlistWithBlockchainData();
  }, [walletClient]);

  const addToWishlist = useCallback((nft: CollectionNFT) => {
    // Check if the NFT is listed before adding to wishlist
    if (!nft.metadata?.isListed) {
      toast.error("Cannot add to wishlist", {
        description: "Only listed NFTs can be added to wishlist",
      });
      return;
    }

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
      const price = item.metadata?.price
        ? Number.parseFloat(item.metadata.price)
        : 0;
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

  const calculatedTotalPrice = getTotalPrice();

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
    totalPrice:
      typeof calculatedTotalPrice === "number" ? calculatedTotalPrice : 0,
    getTotalPriceInCurrency,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { CartItem } from "@/type/cart-wishlist";

// Define a proper type for the listener function
type CartUpdateListener = (items: CartItem[]) => void;

// Create a simple global state for cart count
let globalCartItems: CartItem[] = [];
let globalCartListeners: CartUpdateListener[] = [];

// Function to notify all listeners of cart changes
const notifyCartListeners = () => {
  globalCartListeners.forEach((listener) => listener(globalCartItems));
};

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { currencyRates } = useCurrency();

  // Load cart from localStorage on mount and subscribe to changes
  useEffect(() => {
    // Initial load from localStorage
    const loadFromStorage = () => {
      const storedCart = localStorage.getItem("nft-cart");
      if (storedCart) {
        try {
          const items = JSON.parse(storedCart);
          globalCartItems = items;
          setCartItems(items);
          setCartCount(items.length);
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
        }
      }
    };

    // Load initial data
    loadFromStorage();

    // Add listener for updates
    const handleCartUpdate: CartUpdateListener = (items) => {
      setCartItems([...items]);
      setCartCount(items.length);
    };

    globalCartListeners.push(handleCartUpdate);

    // Clean up listener on unmount
    return () => {
      globalCartListeners = globalCartListeners.filter(
        (listener) => listener !== handleCartUpdate
      );
    };
  }, []);

  const addToCart = useCallback((nft: CollectionNFT) => {
    // Check if the NFT is listed before adding to cart
    if (!nft.metadata?.isListed) {
      toast.error("Cannot add to cart", {
        description: "Only listed NFTs can be added to cart",
      });
      return;
    }

    const exists = globalCartItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );

    if (exists) {
      toast.info("NFT is already in your cart");
      return;
    }

    const cartItem: CartItem = {
      ...nft,
      addedAt: Date.now(),
    };

    // Update global state
    globalCartItems = [...globalCartItems, cartItem];

    // Update localStorage
    localStorage.setItem("nft-cart", JSON.stringify(globalCartItems));

    // Notify all listeners
    notifyCartListeners();

    toast.success("Added to cart", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been added to your cart`,
    });
  }, []);

  const removeFromCart = useCallback((nft: CollectionNFT) => {
    // Update global state
    globalCartItems = globalCartItems.filter(
      (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
    );

    // Update localStorage
    localStorage.setItem("nft-cart", JSON.stringify(globalCartItems));

    // Notify all listeners
    notifyCartListeners();

    toast.success("Removed from cart", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been removed from your cart`,
    });
  }, []);

  const isInCart = useCallback((nft: CollectionNFT) => {
    return globalCartItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );
  }, []);

  const clearCart = useCallback(() => {
    // Update global state
    globalCartItems = [];

    // Update localStorage
    localStorage.setItem("nft-cart", JSON.stringify([]));

    // Notify all listeners
    notifyCartListeners();

    toast.success("Cart cleared");
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // If the NFT has a price, use it, otherwise default to 0
      const price = item.metadata?.price
        ? Number.parseFloat(item.metadata.price)
        : 0;
      return total + price;
    }, 0);
  }, [cartItems]);

  const getTotalPriceInCurrency = useCallback(
    (currency: string) => {
      const totalEth = getTotalPrice();
      return totalEth * (currencyRates[currency] || 0);
    },
    [getTotalPrice, currencyRates]
  );

  const calculatedTotalPrice = getTotalPrice();
  return {
    cartItems,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart,
    cartCount,
    totalPrice:
      typeof calculatedTotalPrice === "number" ? calculatedTotalPrice : 0,
    getTotalPriceInCurrency,
  };
}

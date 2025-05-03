"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { CartItem } from "@/type/cart-wishlist";

// Create a custom event for cart updates
const CART_UPDATE_EVENT = "cart-update";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { currencyRates } = useCurrency();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("nft-cart");
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        setCartCount(items.length);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setIsLoaded(true);

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const storedCart = localStorage.getItem("nft-cart");
      if (storedCart) {
        try {
          const items = JSON.parse(storedCart);
          setCartItems(items);
          setCartCount(items.length);
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
        }
      }
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nft-cart", JSON.stringify(cartItems));
      setCartCount(cartItems.length);

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((nft: CollectionNFT) => {
    setCartItems((prev) => {
      const exists = prev.some(
        (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
      );

      if (exists) {
        toast.info("NFT is already in your cart");
        return prev;
      }

      const cartItem: CartItem = {
        ...nft,
        addedAt: Date.now(),
      };

      toast.success("Added to cart", {
        description: `${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        } has been added to your cart`,
      });

      const newItems = [...prev, cartItem];

      // Update localStorage directly to ensure immediate updates across components
      localStorage.setItem("nft-cart", JSON.stringify(newItems));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));

      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((nft: CollectionNFT) => {
    setCartItems((prev) => {
      const newItems = prev.filter(
        (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
      );

      toast.success("Removed from cart", {
        description: `${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        } has been removed from your cart`,
      });

      // Update localStorage directly to ensure immediate updates across components
      localStorage.setItem("nft-cart", JSON.stringify(newItems));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event(CART_UPDATE_EVENT));

      return newItems;
    });
  }, []);

  const isInCart = useCallback(
    (nft: CollectionNFT) => {
      return cartItems.some(
        (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
      );
    },
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);

    // Update localStorage directly to ensure immediate updates across components
    localStorage.setItem("nft-cart", JSON.stringify([]));

    // Dispatch event to notify other components
    window.dispatchEvent(new Event(CART_UPDATE_EVENT));

    toast.success("Cart cleared");
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // If the NFT has a price, use it, otherwise default to 0
      const price = item.metadata?.price ? item.metadata.price : 0;
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

  return {
    cartItems,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart,
    cartCount,
    totalPrice: getTotalPrice(),
    getTotalPriceInCurrency,
  };
}

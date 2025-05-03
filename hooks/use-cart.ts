"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { CartItem } from "@/type/cart-wishlist";

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
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nft-cart", JSON.stringify(cartItems));
      setCartCount(cartItems.length);
    }
  }, [cartItems, isLoaded]);

  const addToCart = (nft: CollectionNFT) => {
    // Check if NFT is already in cart
    const exists = cartItems.some(
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

    setCartItems((prev) => [...prev, cartItem]);
    setCartCount((prev) => prev + 1);
    toast.success("Added to cart", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been added to your cart`,
    });
  };

  const removeFromCart = (nft: CollectionNFT) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
      )
    );
    setCartCount((prev) => prev - 1);
    toast.success("Removed from cart", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been removed from your cart`,
    });
  };

  const isInCart = (nft: CollectionNFT) => {
    return cartItems.some(
      (item) => item.tokenId === nft.tokenId && item.owner === nft.owner
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    toast.success("Cart cleared");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
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

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useCurrency } from "@/contexts/currency-context";
import { CartItem } from "@/type/cart-wishlist";
import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";

// Type for listener functions that react to cart changes
type CartUpdateListener = (items: CartItem[]) => void;

// Global state for cart and listeners
let globalCartItems: CartItem[] = [];
let globalCartListeners: CartUpdateListener[] = [];

// Notify all components subscribed to cart updates
const notifyCartListeners = () => {
  globalCartListeners.forEach((listener) => listener(globalCartItems));
};

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { currencyRates } = useCurrency();
  const { data: walletClient } = useWalletClient();

  // First, load cart directly from localStorage to show items immediately
  useEffect(() => {
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

    loadFromStorage();

    const handleCartUpdate: CartUpdateListener = (items) => {
      setCartItems([...items]);
      setCartCount(items.length);
    };

    globalCartListeners.push(handleCartUpdate);

    return () => {
      globalCartListeners = globalCartListeners.filter(
        (listener) => listener !== handleCartUpdate
      );
    };
  }, []);

  // Then, in a separate effect, validate and enhance cart items with blockchain data
  useEffect(() => {
    const validateAndEnhanceCartItems = async () => {
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

        // Get stored cart items from localStorage
        const storedCart = localStorage.getItem("nft-cart");
        if (!storedCart) return;

        let storedCartItems: CartItem[] = [];
        try {
          storedCartItems = JSON.parse(storedCart);
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          return;
        }

        // Create a map for faster lookups
        const marketItemsMap = new Map<string, CollectionNFT>();
        allMarketItems.forEach((item) => {
          const key = `${item.tokenId}-${item.owner}`;
          marketItemsMap.set(key, item);
        });

        // Keep valid items and enhance them with blockchain data
        const validItems: CartItem[] = [];
        let removedItemsCount = 0;

        storedCartItems.forEach((item) => {
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
          globalCartItems = validItems;
          localStorage.setItem("nft-cart", JSON.stringify(validItems));

          // Show a notification
          toast.info(
            `Removed ${removedItemsCount} item${
              removedItemsCount !== 1 ? "s" : ""
            } that no longer exist`,
            {
              description:
                "Some NFTs in your cart may have been burned or transferred",
            }
          );
        }

        setCartItems(validItems);
        setCartCount(validItems.length);
        notifyCartListeners();
      } catch (error) {
        console.error("Failed to fetch collection data:", error);
        toast.error("Failed to load collection data");
        // Important: Don't clear the cart on error!
      }
    };

    validateAndEnhanceCartItems();
  }, [walletClient]);

  const addToCart = useCallback((nft: CollectionNFT) => {
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

    globalCartItems = [...globalCartItems, cartItem];
    localStorage.setItem("nft-cart", JSON.stringify(globalCartItems)); // Update localStorage on add
    notifyCartListeners();

    toast.success("Added to cart", {
      description: `${
        nft.metadata?.name || `NFT #${nft.tokenId}`
      } has been added to your cart`,
    });
  }, []);

  const removeFromCart = useCallback((nft: CollectionNFT) => {
    globalCartItems = globalCartItems.filter(
      (item) => !(item.tokenId === nft.tokenId && item.owner === nft.owner)
    );

    localStorage.setItem("nft-cart", JSON.stringify(globalCartItems)); // Update localStorage on remove
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
    globalCartItems = [];
    localStorage.setItem("nft-cart", JSON.stringify([])); // Clear localStorage
    notifyCartListeners();
    toast.success("Cart cleared");
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
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

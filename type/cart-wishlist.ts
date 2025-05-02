import type { CollectionNFT } from "@/type/CollectionNFT";

export interface CartItem extends CollectionNFT {
  addedAt: number;
}

export interface WishlistItem extends CollectionNFT {
  addedAt: number;
}

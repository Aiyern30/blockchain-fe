import type { CollectionNFT } from "@/type/CollectionNFT";

// Check if user is the NFT owner
export const isNFTOwner = (
  nft: CollectionNFT,
  userAddress: string
): boolean => {
  if (!userAddress || !nft) return false;
  return nft.owner.toLowerCase() === userAddress.toLowerCase();
};

// Check if NFT is listed for sale
export const isNFTListed = (nft: CollectionNFT): boolean => {
  // Check if the NFT has the isListed property directly
  if (nft.isListed !== undefined) {
    return nft.isListed;
  }

  // Check if the NFT has metadata with isListed property
  if (nft.metadata?.isListed !== undefined) {
    return nft.metadata.isListed;
  }

  // Check if the NFT has a market item that's not sold
  if (nft.marketItem && !nft.marketItem.sold) {
    return true;
  }

  return false;
};

// Check if user is the collection creator
export const isCollectionCreator = (
  collectionOwner: string,
  userAddress: string
): boolean => {
  if (!userAddress || !collectionOwner) return false;
  return collectionOwner.toLowerCase() === userAddress.toLowerCase();
};

// Check if an NFT can be resold by the current user
export const canResell = (nft: CollectionNFT, userAddress: string): boolean => {
  // User must be the owner
  if (!isNFTOwner(nft, userAddress)) return false;

  // NFT must not be currently listed
  if (isNFTListed(nft)) return false;

  // NFT must have been previously sold through the marketplace
  // (which means it has a market item with sold=true)
  return !!nft.marketItem && nft.marketItem.sold === true;
};

// Check if user can burn an NFT (only owner or creator can burn)
export const canBurnNFT = (
  nft: CollectionNFT,
  userAddress: string,
  collectionOwner: string
): boolean => {
  return (
    isNFTOwner(nft, userAddress) ||
    isCollectionCreator(collectionOwner, userAddress)
  );
};

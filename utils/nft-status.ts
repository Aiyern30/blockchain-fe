/* eslint-disable @typescript-eslint/no-explicit-any */
// Create a utility function to check NFT listing status consistently
export const isNFTListed = (nft: any): boolean => {
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

// Check if user is the true owner of an NFT (accounting for marketplace contract)
export const isTrueOwner = (nft: any, userAddress: string): boolean => {
  if (!userAddress) return false;

  // If the NFT is sold through the marketplace, check the marketItem owner
  if (nft.marketItem && nft.marketItem.sold) {
    return nft.marketItem.owner.toLowerCase() === userAddress.toLowerCase();
  }

  // Otherwise check the NFT owner field
  return nft.owner.toLowerCase() === userAddress.toLowerCase();
};

// Check if an NFT can be resold by the current user
export const canResell = (nft: any, userAddress: string): boolean => {
  // User must be the true owner
  if (!isTrueOwner(nft, userAddress)) return false;

  // NFT must not be currently listed
  if (isNFTListed(nft)) return false;

  // NFT must have been previously sold through the marketplace
  // (which means it has a marketItem)
  return !!nft.marketItem;
};

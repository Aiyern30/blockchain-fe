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
  // For debugging
  console.log("Checking if NFT can be resold:", {
    tokenId: nft.tokenId,
    isOwner: isNFTOwner(nft, userAddress),
    hasMarketItem: !!nft.marketItem,
    isListed: isNFTListed(nft),
    marketItemSold: nft.marketItem?.sold,
  });

  // Simplified logic: Allow reselling if you own the NFT and it's not currently listed
  // We're removing the requirement for a market item with sold=true
  return isNFTOwner(nft, userAddress) && !isNFTListed(nft);
};

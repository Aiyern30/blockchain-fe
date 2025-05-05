import type { CollectionNFT } from "@/type/CollectionNFT";

/**
 * Determines if an NFT is listed for sale
 * @param nft The NFT to check
 * @returns boolean indicating if the NFT is listed for sale
 */
export function isNFTListed(nft: CollectionNFT): boolean {
  // Check both the metadata flag AND the market item status
  const isListedInMetadata = nft.metadata?.isListed === true;
  const hasActiveMarketItem = nft.marketItem !== null && !nft.marketItem?.sold;

  // Return true if either condition is met
  return isListedInMetadata || hasActiveMarketItem;
}

/**
 * Logs NFT status information to the console
 * @param nft The NFT to log information about
 */
export function logNFTStatus(nft: CollectionNFT): void {
  console.log(`NFT #${nft.tokenId} listing status:`, {
    metadataIsListed: nft.metadata?.isListed,
    hasMarketItem: nft.marketItem !== null,
    marketItemSold: nft.marketItem?.sold,
    finalIsListed: isNFTListed(nft),
    owner: nft.owner,
    marketItemDetails: nft.marketItem,
  });
}

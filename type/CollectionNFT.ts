import type { NFTMetadata } from "./NFT";
import type { MarketItem } from "@/lib/erc721Config";

export interface CollectionNFT {
  tokenId: number;
  metadataUrl: string;
  owner: string;
  metadata?: NFTMetadata;
  marketItem?: MarketItem | null;
  isListed?: boolean;
}

import { NFTMetadata } from "./NFT";

export interface CollectionNFT {
  tokenId: number;
  metadataUrl: string;
  owner: string;
  metadata?: NFTMetadata;
}

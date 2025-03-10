export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name?: string;
  image?: string;
  attributes?: NFTAttribute[];
  id?: number;
}

export interface FetchedNFT {
  title?: string;
  image?: string;
  floor?: string;
  id?: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name?: string;
  image?: string;
  attributes?: NFTAttribute[];
  id?: number;
  collection?: string;
}

export interface FetchedNFT {
  id?: number;
  cid?: string;
  title: string;
  image: string;
  floor: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  price?: number;

  attributes?: { trait_type: string; value: string }[];
}

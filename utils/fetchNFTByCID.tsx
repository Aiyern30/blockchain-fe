import { FetchedNFT, NFTAttribute, NFTMetadata } from "@/type/NFT";

export async function fetchNFTByCID(
  nftCID: string
): Promise<FetchedNFT | null> {
  try {
    console.log(`Fetching NFT details for CID: ${nftCID}`);

    const metadataUrl = `https://ipfs.io/ipfs/${nftCID}`;
    const response = await fetch(metadataUrl);

    if (!response.ok) {
      console.warn(`Failed to fetch metadata for CID: ${nftCID}`);
      return null;
    }

    const metadata: NFTMetadata = await response.json();

    return {
      id: metadata.id,
      cid: nftCID,
      title: metadata.name || "Unknown NFT",
      image: metadata.image || "/nft-placeholder.png",
      floor:
        metadata.attributes?.find(
          (attr: NFTAttribute) => attr.trait_type === "Price"
        )?.value || "N/A",
    };
  } catch (error) {
    console.error(`Error fetching NFT details for CID: ${nftCID}`, error);
    return null;
  }
}

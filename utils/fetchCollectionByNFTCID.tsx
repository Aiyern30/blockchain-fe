import { Collection, NFTMetadata } from "@/type/NFT";

export async function fetchCollectionByNFTCID(
  nftCID: string
): Promise<Collection | null> {
  try {
    console.log(`Fetching collection data for NFT CID: ${nftCID}`);

    const nftMetadataUrl = `https://ipfs.io/ipfs/${nftCID}`;
    const nftResponse = await fetch(nftMetadataUrl);
    if (!nftResponse.ok) return null;

    const nftMetadata: NFTMetadata & { collection?: string } =
      await nftResponse.json();

    if (!nftMetadata.collection) return null;

    const collectionCID = nftMetadata.collection.replace("ipfs://", "");
    const collectionMetadataUrl = `https://ipfs.io/ipfs/${collectionCID}`;
    const collectionResponse = await fetch(collectionMetadataUrl);

    if (!collectionResponse.ok) return null;

    const collectionData: Collection = await collectionResponse.json();
    return collectionData;
  } catch (error) {
    console.error(
      `Error fetching collection data for NFT CID: ${nftCID}`,
      error
    );
    return null;
  }
}

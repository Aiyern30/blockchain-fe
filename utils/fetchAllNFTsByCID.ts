/* eslint-disable @typescript-eslint/no-explicit-any */
interface NFTAttribute {
  type: string;
  name: string;
}

interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTAttribute[];
  collectionCID: string;
}

function formatIPFSUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("ipfs://")
    ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
    : url;
}

export async function fetchNFTsByCollectionID(
  collectionCID: string
): Promise<NFT[]> {
  try {
    const baseUrl = `https://ipfs.io/ipfs/${collectionCID}`;
    console.log(`Fetching NFTs metadata from IPFS: ${baseUrl}`);

    const response = await fetch(baseUrl);
    if (!response.ok) throw new Error("Failed to fetch collection metadata");

    const collectionMetadata = await response.json();
    console.log("Fetched collection metadata from IPFS:", collectionMetadata);

    if (!collectionMetadata.nfts || !Array.isArray(collectionMetadata.nfts)) {
      throw new Error("No NFT list found in the collection metadata.");
    }

    // Fetch metadata for each NFT in the collection
    const nftPromises = collectionMetadata.nfts.map(
      async (nftCID: string, index: number) => {
        const nftResponse = await fetch(`https://ipfs.io/ipfs/${nftCID}`);
        if (!nftResponse.ok)
          throw new Error(`Failed to fetch NFT metadata: ${nftCID}`);
        const nftMetadata = await nftResponse.json();

        return {
          tokenId: index.toString(),
          name: nftMetadata.name || "Unnamed NFT",
          description: nftMetadata.description || "No description",
          image: formatIPFSUrl(nftMetadata.image),
          external_url: nftMetadata.external_url || "",
          attributes: nftMetadata.attributes || [],
          collectionCID: collectionCID,
        };
      }
    );

    const nfts = await Promise.all(nftPromises);
    console.log("Fetched NFTs:", nfts);
    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs from IPFS:", error);
    return [];
  }
}

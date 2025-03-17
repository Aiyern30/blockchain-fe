import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";

interface NFTAttribute {
  type: string;
  name: string;
}

interface NFT {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTAttribute[];
  collectionCID: string;
}

function formatIPFSUrl(url: string): string {
  if (!url) return "";

  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return url;
}

export async function fetchNFTsByCollectionID(
  collectionCID: string
): Promise<NFT[]> {
  try {
    console.log(`Fetching NFTs for collection: ${collectionCID}...`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const rawNFTs = await nftContract.getAllNFTsByCID(collectionCID);
    console.log("Raw NFTs data from contract:", rawNFTs);

    if (!rawNFTs || rawNFTs.length === 0) {
      console.warn("No NFTs found for the specified collection.");
      return [];
    }

    const [tokenIds, uris]: [ethers.BigNumberish[], string[]] = rawNFTs;

    if (tokenIds.length === 0) {
      console.warn("NFT arrays are empty.");
      return [];
    }

    const nfts: NFT[] = await Promise.all(
      tokenIds.map(async (tokenId, index) => {
        const tokenURI = uris[index];
        const metadata = await fetchMetadataFromIPFS(tokenURI);

        return {
          name: metadata.name || "Unnamed NFT",
          description: metadata.description || "No description",
          image: formatIPFSUrl(metadata.image),
          external_url: metadata.external_url || "",
          attributes: metadata.attributes || [],
          collectionCID: collectionCID,
        };
      })
    );

    console.log("Fetched NFTs:", nfts);
    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs for collection:", error);
    return [];
  }
}

async function fetchMetadataFromIPFS(tokenURI: string) {
  try {
    const response = await fetch(formatIPFSUrl(tokenURI));
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata from IPFS:", error);
    return {};
  }
}

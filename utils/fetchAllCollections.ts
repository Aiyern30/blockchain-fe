import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";

interface CollectionData {
  name: string;
  description: string;
  image: string;
  collectionUrl: string;
}

function formatIPFSUrl(url: string): string {
  if (!url) return "";

  // Convert IPFS URL to a public gateway
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return url;
}

export async function fetchAllCollections(): Promise<CollectionData[]> {
  try {
    console.log("Fetching collections...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const rawCollections = await nftContract.getAllCollections();
    console.log("Raw collections data from contract:", rawCollections);

    if (!rawCollections || rawCollections.length === 0) {
      console.warn("No collections found in contract.");
      return [];
    }

    const [names, descriptions, images, baseURIs]: [
      string[],
      string[],
      string[],
      string[]
    ] = rawCollections;

    if (names.length === 0) {
      console.warn("Collection arrays are empty.");
      return [];
    }

    const collections: CollectionData[] = names.map((name, index) => ({
      name: name || "Unnamed Collection",
      description: descriptions[index] || "No description",
      image: formatIPFSUrl(images[index]),
      collectionUrl: formatIPFSUrl(baseURIs[index]),
    }));

    console.log("Fetched collections:", collections);
    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

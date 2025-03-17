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

    // ✅ If the contract has a method to get collections directly
    if (nftContract.getAllCollections) {
      const collectionURIs: string[] = await nftContract.getAllCollections();
      const collections: CollectionData[] = [];

      for (const uri of collectionURIs) {
        try {
          const formattedUrl = formatIPFSUrl(uri);
          console.log(`Fetching collection metadata: ${formattedUrl}`);
          const response = await fetch(formattedUrl);
          if (!response.ok) continue;

          const data = await response.json();

          collections.push({
            name: data.name || "Unnamed Collection",
            description: data.description || "No description",
            image: formatIPFSUrl(data.image),
            collectionUrl: formattedUrl,
          });
        } catch (error) {
          console.warn(
            `Error fetching collection metadata from ${uri}:`,
            error
          );
        }
      }

      console.log("Fetched collections:", collections);
      return collections;
    } else {
      console.error("Contract does not support fetching collections directly.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

import { getERC721Contract } from "@/lib/erc721Config";
import { FetchedNFT, NFTAttribute, NFTMetadata } from "@/type/NFT";
import { ethers } from "ethers";

interface Collection {
  name: string;
  description: string;
  image?: string;
  collectionUrl: string;
  nfts: FetchedNFT[];
}

// Utility function to format IPFS URLs properly
const formatIPFSUrl = (url?: string) => {
  if (!url) return "";

  // Trim to remove extra spaces
  url = url.trim();

  // Ensure that if the URL starts with "ipfs://", we correctly replace it
  if (url.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${url.replace("ipfs://", "")}`;
  }

  // Ensure the URL is not mistakenly concatenated
  if (!url.startsWith("http") && !url.startsWith("https")) {
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  }

  return url;
};

export async function fetchCollectionsWithNFTs() {
  try {
    console.log("Fetching all NFTs...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    // Get the total supply of NFTs
    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());
    console.log("Total NFTs Supply:", totalSupply);

    const collections: Record<string, Collection> = {};

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        // Fetch the NFT metadata URI
        let tokenURI = await nftContract.tokenURI(tokenId);
        if (!tokenURI) continue;

        tokenURI = formatIPFSUrl(tokenURI); // Ensure the URL is properly formatted

        console.log(`Fetching metadata for Token ID ${tokenId}:`, tokenURI);
        const response = await fetch(tokenURI);
        if (!response.ok) {
          console.warn(`Failed to fetch metadata for Token ID ${tokenId}`);
          continue;
        }

        const metadata: NFTMetadata & { collection?: string } =
          await response.json();
        if (!metadata.collection) continue;

        const collectionUrl = formatIPFSUrl(metadata.collection);

        // Fetch collection data if it doesn't exist
        if (!collections[collectionUrl]) {
          console.log(`Fetching collection data from: ${collectionUrl}`);

          const collectionResponse = await fetch(collectionUrl);
          if (!collectionResponse.ok) {
            console.warn(`Failed to fetch collection data: ${collectionUrl}`);
            continue;
          }

          const collectionData = await collectionResponse.json();

          collections[collectionUrl] = {
            name: collectionData.name || "Unnamed Collection",
            description: collectionData.description || "No description",
            image: formatIPFSUrl(collectionData.image),
            collectionUrl,
            nfts: [],
          };
        }

        // Add NFT to the respective collection
        collections[collectionUrl].nfts.push({
          id: tokenId,
          title: metadata.name || `NFT #${tokenId}`,
          image: formatIPFSUrl(metadata.image ?? ""),
          floor:
            metadata.attributes?.find(
              (attr: NFTAttribute) => attr.trait_type === "Price"
            )?.value || "N/A",
        });

        console.log(
          `Added NFT #${tokenId} to collection:`,
          collections[collectionUrl].name
        );
      } catch (error) {
        console.warn(`Error fetching NFT ${tokenId}:`, error);
      }
    }

    // Convert collections object to an array
    const collectionsArray = Object.values(collections);

    console.log("Fetched Collections with NFTs:", collectionsArray);
    return collectionsArray;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

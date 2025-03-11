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

export async function fetchCollectionsWithNFTs() {
  try {
    console.log("Fetching all NFTs...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());

    console.log("Total NFTs Supply:", totalSupply);

    const collections: Record<string, Collection> = {};

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const tokenURI = await nftContract.tokenURI(tokenId);
        if (!tokenURI) continue;

        const response = await fetch(tokenURI);
        if (!response.ok) continue;

        const metadata: NFTMetadata & { collection?: string } =
          await response.json();
        if (!metadata.collection) continue;

        const collectionUrl = metadata.collection;

        if (!collections[collectionUrl]) {
          const collectionResponse = await fetch(collectionUrl);
          if (!collectionResponse.ok) continue;

          const collectionData = await collectionResponse.json();

          collections[collectionUrl] = {
            name: collectionData.name || "Unnamed Collection",
            description: collectionData.description || "No description",
            image: collectionData.image || "",
            collectionUrl,
            nfts: [],
          };
        }

        // Add NFT to the respective collection
        collections[collectionUrl].nfts.push({
          id: tokenId,
          title: metadata.name || `NFT #${tokenId}`,
          image: metadata.image || "",
          floor:
            metadata.attributes?.find(
              (attr: NFTAttribute) => attr.trait_type === "Price"
            )?.value || "N/A",
        });
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

import { getERC721Contract } from "@/lib/erc721Config";
import { FetchedNFT, NFTAttribute, NFTMetadata } from "@/type/NFT";
import { ethers } from "ethers";

export async function fetchNFTsByCollectionId(collectionId: string) {
  try {
    console.log(`Fetching NFTs for collection: ${collectionId}`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());

    console.log("Total NFTs Supply:", totalSupply);

    const nfts: FetchedNFT[] = [];

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const tokenURI = await nftContract.tokenURI(tokenId);
        if (!tokenURI) continue;

        const response = await fetch(tokenURI);
        if (!response.ok) continue;

        const metadata: NFTMetadata & { collection?: string } =
          await response.json();
        if (!metadata.collection || metadata.collection !== collectionId)
          continue;

        // Add NFT to the array
        nfts.push({
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

    console.log(`Fetched NFTs for collection ${collectionId}:`, nfts);
    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs by collection:", error);
    return [];
  }
}

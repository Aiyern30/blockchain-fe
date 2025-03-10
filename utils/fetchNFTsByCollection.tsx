import { getERC721Contract } from "@/lib/erc721Config";
import { NFTAttribute, NFTMetadata } from "@/type/NFT";
import { ethers } from "ethers";

export async function fetchNFTsByCollection(collectionUrl: string) {
  try {
    console.log("Fetching NFTs for collection:", collectionUrl);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());

    console.log("Total NFTs Supply:", totalSupply);

    const nftList = [];

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const tokenURI = await nftContract.tokenURI(tokenId);
        console.log(`Fetching Token #${tokenId} URI:`, tokenURI);

        if (!tokenURI) {
          console.warn(`Token #${tokenId} has no URI`);
          continue;
        }

        const response = await fetch(tokenURI);
        if (!response.ok) {
          console.warn(`Failed to fetch metadata for Token #${tokenId}`);
          continue;
        }

        const metadata: NFTMetadata = await response.json();
        console.log(`Metadata for Token #${tokenId}:`, metadata);

        if (metadata.collection === collectionUrl) {
          nftList.push({
            id: tokenId,
            title: metadata.name || `NFT #${tokenId}`,
            floor:
              metadata.attributes?.find(
                (attr: NFTAttribute) => attr.trait_type === "Price"
              )?.value || "N/A",
            image: metadata.image || "",
            verified: true,
          });
        }
      } catch (error) {
        console.warn(`Error fetching NFT ${tokenId}:`, error);
      }
    }

    return nftList;
  } catch (error) {
    console.error("Error fetching NFTs by collection:", error);
    return [];
  }
}

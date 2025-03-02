import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name?: string;
  image?: string;
  attributes?: NFTAttribute[];
}

export async function fetchNFTs() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());

    const nftList = [];

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const tokenURI = await nftContract.tokenURI(tokenId);
        const metadataResponse = await fetch(tokenURI);
        const metadata: NFTMetadata = await metadataResponse.json();

        nftList.push({
          title: metadata.name || `NFT #${tokenId}`,
          floor:
            metadata.attributes?.find(
              (attr: NFTAttribute) => attr.trait_type === "Price"
            )?.value || "N/A",
          image: metadata.image,
          verified: true,
        });
      } catch (error) {
        console.warn(`Error fetching NFT ${tokenId}:`, error);
      }
    }

    return nftList;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

import { getERC721Contract } from "@/lib/erc721Config";
import { FetchedNFT, NFTAttribute, NFTMetadata } from "@/type/NFT";
import { ethers } from "ethers";

export async function fetchNFTByCID(
  nftCID: string
): Promise<FetchedNFT | null> {
  try {
    console.log(`Fetching NFT details for CID: ${nftCID}`);

    const metadataUrl = `https://ipfs.io/ipfs/${nftCID}`;
    const response = await fetch(metadataUrl);

    if (!response.ok) {
      console.warn(`Failed to fetch metadata for CID: ${nftCID}`);
      return null;
    }

    const metadata: NFTMetadata = await response.json();

    let tokenId = metadata.id;
    let owner = "Unknown Owner";

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    if (!tokenId) {
      console.log("Token ID not found in metadata, fetching from contract...");
      const totalSupply = await nftContract.totalSupply();

      for (let i = 1; i <= totalSupply; i++) {
        const tokenURI = await nftContract.tokenURI(i);
        if (tokenURI.includes(nftCID)) {
          tokenId = i;
          break;
        }
      }
    }

    if (tokenId) {
      owner = await nftContract.ownerOf(tokenId);
    }

    return {
      id: tokenId,
      cid: nftCID,
      title: metadata.name || "Unknown NFT",
      image: metadata.image || "/nft-placeholder.png",
      floor:
        metadata.attributes?.find(
          (attr: NFTAttribute) => attr.trait_type === "Price"
        )?.value || "N/A",
      owner,
    };
  } catch (error) {
    console.error(`Error fetching NFT details for CID: ${nftCID}`, error);
    return null;
  }
}

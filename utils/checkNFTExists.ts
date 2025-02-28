import { getERC721Contract } from "@/lib/erc721Config";
import { BrowserProvider, ZeroAddress } from "ethers";

export async function checkNFTExists(
  provider: BrowserProvider,
  tokenId: number,
  ipfsHash: string
): Promise<boolean> {
  try {
    const signer = await provider.getSigner();
    const contract = getERC721Contract(signer);

    // Check if token exists using ownerOf
    let owner;
    try {
      owner = await contract.ownerOf(tokenId);
    } catch (error) {
      console.log("Token ID does not exist:", tokenId, error);
      return false;
    }

    if (owner === ZeroAddress) {
      console.log("NFT does not have an owner, it might not exist.");
      return false;
    }

    // Fetch token URI and validate
    const tokenURI = await contract.tokenURI(tokenId);
    if (tokenURI && tokenURI.includes(ipfsHash)) {
      console.log("NFT exists on blockchain");
      return true;
    } else {
      console.log("NFT metadata does not match.");
    }
  } catch (error) {
    console.log("Error checking NFT existence:", error);
  }

  return false;
}
